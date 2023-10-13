import { OrderStatus } from "@prisma/client";
import prisma from "../../utils/prisma";
import {
  CreateInterestOrderBody,
  DeleteOrderItemsBody,
  GetOrderQuery,
  InputUpdateOrder,
} from "./order.schema";

/**
 * Get Order Input
 * @returns order arary
 */
export async function getOrderStatus(
  data: GetOrderQuery & { ownerId: number }
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
  return prisma.orders.findMany({
    where: {
      deletedAt: null,
      ownerId,
      status: {
        in: statusArr,
      },
    },
  });
}

/**
 * Create Order with Status INTERESTED
 * @returns an order include order items
 */
export async function createInterestedOrder(
  data: CreateInterestOrderBody & { ownerId: number }
) {
  const { productIds, details, ownerId } = data;
  // verify product id
  let amount = 0;
  const products = await Promise.all(
    productIds.map(async (id) => {
      const product = await prisma.products.findFirst({ where: { id } });
      amount += product?.price || 0;
      return product;
    })
  );
  // create order
  const order = await prisma.orders.create({
    data: { details, ownerId, amount, status: OrderStatus.INTERESTED },
  });
  // create order items
  const orderItems = await Promise.all(
    products.map((product) => {
      if (product) {
        return prisma.orderItems.create({
          data: { productId: product.id, orderId: order.id },
        });
      }
      return null;
    })
  );
  return { ...order, orderItems };
}

/**
 * Confirm Order then match stock items with order items
 * @returns an order include order items, product, and stock items
 */
export async function confirmOrder(data: InputUpdateOrder) {
  const { orderId, ownerId } = data;
  // open transaction for prevent candidate update stock item id
  return prisma.$transaction(async (tx) => {
    const order = await tx.orders.update({
      where: {
        ownerId,
        id: orderId,
        deletedAt: null,
        status: OrderStatus.INTERESTED,
      },
      data: { status: OrderStatus.ORDERED },
      include: {
        orderItems: {
          include: {
            product: {
              include: {
                stockItems: true,
              },
            },
          },
        },
      },
    });

    await Promise.all(
      order.orderItems.map((item, index) => {
        const stockItemId = item.product.stockItems[0]?.id;
        order.orderItems[index].stockItemId = stockItemId;
        return tx.orderItems.update({
          where: { id: item.id },
          data: { stockItemId },
        });
      })
    );

    return order;
  });
}

/**
 * Complete Order by stamp delete date to each stock items
 * and change order status to "COMPLETED"
 * @returns an order include order items
 */
export async function completeOrder(data: InputUpdateOrder) {
  const { orderId, ownerId } = data;
  // complete order
  const order = await prisma.orders.update({
    where: {
      ownerId,
      id: orderId,
      deletedAt: null,
      status: OrderStatus.PURCHASED,
    },
    data: { status: OrderStatus.COMPLETED },
    include: {
      orderItems: true
    }
  })

  await Promise.all(order.orderItems.map(item => {
    if (item.stockItemId) {
      // update this stock item was sold
      return prisma.stockItems.update({
        where: { id: item.stockItemId },
        data: { deletedAt: new Date() }
      })
    }
    // if followed the flow step by step this error should not have occurred
    throw new Error('Unprocessable stock item id not found')
  }))

  return order
}

/**
 * Cancel Order by remove stock items from order items
 * @return an order include order items 
 */
export async function cancelOrder(data: InputUpdateOrder) {
  const { orderId, ownerId } = data;
  // cancel order
  const order = await prisma.orders.update({
    where: {
      ownerId,
      id: orderId,
      deletedAt: null,
      status: { in: [OrderStatus.ORDERED, OrderStatus.PURCHASED] },
    },
    data: { deletedAt: new Date() },
    include: {
      orderItems: true,
    },
  });
  // remove stock item id from order item
  await Promise.all(
    order.orderItems.map((item) => {
      prisma.orderItems.update({
        where: { id: item.id },
        data: { stockItemId: null },
      });
    })
  );

  return order
}

/**
 * Delete Order Items
 * @returns an order include order items
 */
export async function deleteOrderItems(
  data: DeleteOrderItemsBody & InputUpdateOrder
) {
  const { orderId, ownerId, orderItemIds } = data;
  // verify order id
  let order = await prisma.orders.findFirst({
    where: {
      deletedAt: null,
      status: OrderStatus.INTERESTED,
      id: orderId,
      ownerId,
    },
    include: {
      orderItems: {
        include: { product: true },
      },
    },
  });

  if (!order) {
    throw new Error("Order ID does not exist!");
  }

  // delete multiple order items
  await prisma.orderItems.deleteMany({
    where: {
      id: { in: orderItemIds },
      orderId,
    },
  });

  order.orderItems = order.orderItems.filter(
    ({ id }) => !orderItemIds.includes(id)
  );

  return { ...order };
}
