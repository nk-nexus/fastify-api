import { OrderStatus } from "@prisma/client";
import prisma from "../../utils/prisma";
import {
  AddOrderItemsBody,
  CreateInterestOrderBody,
  DeleteOrderItemsBody,
  GetOrderQuery,
  InputUpdateOrder,
} from "./order.schema";
import { verifyOrder } from "./order.util";
import { Decimal } from "@prisma/client/runtime/library";

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
  let amount = new Decimal(0);
  const products = await Promise.all(
    productIds.map(async (id) => {
      const product = await prisma.products.findFirst({ where: { id } });
      amount = Decimal.add(amount, product?.price || 0);
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

    // check stocks are matched enough for the order
    const orderDemand: Map<number, number> = new Map();
    order.orderItems = order.orderItems.map((item) => {
      let demand = orderDemand.get(item.productId);
      demand = demand ? demand + 1 : 1;
      // mapping [productId, demand]
      orderDemand.set(item.productId, demand);
      // find total in-stock items
      const inStockIds = item.product.stockItems.reduce<number[]>(
        (p, n) => (n.deletedAt ? p : [...p, n.id]),
        [] // default stock item id array
      );
      // when current demand > in-stock items
      // throw error "Unprocessable Entity"
      if (demand > inStockIds.length) {
        throw new Error(
          `Product ${item.productId} does not have enough for order demand`
        );
      }
      // set stock item id for the order item
      Reflect.set(item, "stockItemId", inStockIds[demand - 1]);
      // remove unused stock items from product
      Reflect.set(item.product, "stockItems", null);
      return { ...item };
    });

    await Promise.all([
      // multiple add stock items to order items
      ...order.orderItems.map(({ id, stockItemId }) => {
        return tx.orderItems.update({
          where: { id },
          data: { stockItemId },
        });
      }),
      // multiple soft delete stock items
      ...order.orderItems.map((item) => {
        if (item.stockItemId) {
          // update this stock item was sold
          return tx.stockItems.update({
            where: { id: item.stockItemId },
            data: { deletedAt: new Date() },
          });
        }
        // if followed the flow step by step this error should not have occurred
        throw new Error("Stock Item ID not found");
      })
    ]);

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
  return prisma.orders.update({
    where: {
      ownerId,
      id: orderId,
      deletedAt: null,
      status: OrderStatus.PURCHASED,
    },
    data: { status: OrderStatus.COMPLETED },
    include: {
      orderItems: {
        include: {
          product: true,
        },
      },
    },
  });
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
      orderItems: {
        include: {
          product: true,
        },
      },
    },
  });
  
  await Promise.all([
    // remove stock item id from order item
    ...order.orderItems.map((item) => {
      return prisma.orderItems.update({
        where: { id: item.id },
        data: { stockItemId: null },
      });
    }),
    // multiple soft delete stock items
    ...order.orderItems.map((item) => {
      if (item.stockItemId) {
        // update this stock item was sold
        return prisma.stockItems.update({
          where: { id: item.stockItemId },
          data: { deletedAt: null },
        });
      }
      // if followed the flow step by step this error should not have occurred
      throw new Error("Stock Item ID not found");
    })
  ]);

  return order;
}

/**
 * Add Order Items, and update order total amount
 * @return an order include order items
 */
export async function addOrderItems(
  data: AddOrderItemsBody & InputUpdateOrder
) {
  const { orderId, ownerId, productIds } = data;
  // verify order id
  const order = await verifyOrder({ orderId, ownerId });
  // check product ids
  let products = await prisma.products.findMany({
    where: { id: { in: productIds } },
  });
  // add multiple order items
  await prisma.orderItems.createMany({
    data: productIds
      .filter((id) => !!products.find((p) => p.id === id))
      .map((id) => ({
        productId: id,
        orderId,
      })),
  });
  // update order total amount
  const amount = productIds.reduce((p, n) => {
    const product = products.find((p) => p.id === n);
    return Decimal.add(p, product?.price || 0);
  }, order.amount);
  return prisma.orders.update({
    where: { id: order.id },
    data: { amount },
    include: {
      orderItems: {
        include: {
          product: true,
        },
      },
    },
  });
}

/**
 * Delete Order Items, and update order total amount
 * @returns an order include order items
 */
export async function deleteOrderItems(
  data: DeleteOrderItemsBody & InputUpdateOrder
) {
  const { orderId, ownerId, orderItemIds } = data;
  // verify order id
  let order = await verifyOrder({ orderId, ownerId });
  // delete multiple order items
  await prisma.orderItems.deleteMany({
    where: {
      id: { in: orderItemIds },
      orderId,
    },
  });

  let amount = order.amount;
  order.orderItems = order.orderItems.filter((item) => {
    if (orderItemIds.includes(item.id)) {
      amount = Decimal.sub(amount, item.product.price);
      return false; // not return removed item
    }
    return true; // return not removed item
  });

  // update order total amount
  return prisma.orders.update({
    where: { id: order.id },
    data: { amount },
    include: {
      orderItems: {
        include: {
          product: true,
        },
      },
    },
  });
}
