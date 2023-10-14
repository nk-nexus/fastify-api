import { OrderStatus } from "@prisma/client";
import prisma from "../../utils/prisma";
import { DeleteOrderItemsBody, InputUpdateOrder } from "./order.schema";

export async function verifyOrder(data: {
    orderId: number,
    ownerId: number,
}) {
  const { orderId, ownerId } = data;
  const order = await prisma.orders.findFirst({
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

  return order;
}
