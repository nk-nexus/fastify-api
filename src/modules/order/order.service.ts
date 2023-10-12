import { OrderStatus } from "@prisma/client";
import prisma from "../utils/prisma";
import {
  CreateInterestOrderInput,
  DeleteOrderItemsInput,
  FindOrderInput,
  GetOrderInput,
  OrderIdInput,
} from "./order.schema";
import { throws } from "assert";

/**
 * Get Order Input
 * @param data contains ownerId and status that seperate by comma
 * @returns order arary
 */
export async function getOrderStatus(
  data: GetOrderInput & { ownerId: number }
) {
  const { ownerId, status } = data;
  const statusArr = status.split(",").map((s) => {
    switch (s) {
      case "o":
        return OrderStatus.ORDERED;
      case "p":
        return OrderStatus.PURCHASED;
      case "c":
        return OrderStatus.COMPLETED;
      default:
        return OrderStatus.INTERESTED;
    }
  });
  return prisma.order.findMany({
    where: {
      deletedAt: null,
      ownerId,
      status: {
        in: statusArr,
      },
    },
  });
}

export async function createInterestedOrder(
  data: CreateInterestOrderInput & { ownerId: number }
) {
  const { productIds, details, ownerId } = data;
  // verify product id
  let total = 0;
  const products = await Promise.all(
    productIds.map(async (id) => {
      const product = await prisma.product.findFirst({ where: { id } });
      total += product?.price || 0;
      return product;
    })
  );
  // create order
  const order = await prisma.order.create({
    data: { details, ownerId, total, status: OrderStatus.INTERESTED },
  });
  // create order items
  const orderItems = await Promise.all(
    products.map((product) => {
      if (product) {
        return prisma.orderItem.create({
          data: { productId: product.id, orderId: order.id },
        });
      }
      return null;
    })
  );
  return { ...order, orderItems };
}

export async function cancelOrder(data: FindOrderInput) {
  const { orderId, ownerId } = data;
  // verify order id
  const order = await prisma.order.findFirst({
    where: {
      ownerId,
      id: orderId,
      deletedAt: null,
      status: { in: [OrderStatus.ORDERED, OrderStatus.PURCHASED] },
    },
  });
  if (!order) {
    throw new Error("Order ID does not exist!");
  }
  // cancel order
  return prisma.order.update({
    where: { id: orderId },
    data: { deletedAt: new Date() },
  });
}

export async function deleteOrderItems(
  data: DeleteOrderItemsInput & FindOrderInput
) {
  const { orderId, ownerId, orderItemIds } = data;
  // verify order id
  let order = await prisma.order.findFirst({
    where: {
      deletedAt: null,
      status: OrderStatus.INTERESTED,
      id: orderId,
      ownerId,
    },
    include: {
      orderItem: {
        include: { product: true },
      },
    },
  });

  if (!order) {
    throw new Error("Order ID does not exist!");
  }

  // delete multiple order items
  await prisma.orderItem.deleteMany({
    where: {
      id: { in: orderItemIds },
      orderId,
    },
  });

  order.orderItem = order.orderItem.filter(
    ({ id }) => !orderItemIds.includes(id)
  );

  return { ...order };
}
