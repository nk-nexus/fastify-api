import { OrderStatus } from "@prisma/client";
import prisma from "../utils/prisma";
import {
  CreateInterestOrderInput,
  DeleteOrderItemsInput,
  GetOrderInput,
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
  body: CreateInterestOrderInput & { ownerId: number }
) {
  const { productIds, details, ownerId } = body;
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

export async function deleteOrderItems(
  body: DeleteOrderItemsInput & { orderId: number; ownerId: number }
) {
  const { orderId, ownerId, orderItemIds } = body;
  // verify order id
  let order = await prisma.order.findFirst({
    where: {
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

  return { ...order, };
}
