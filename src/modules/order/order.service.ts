import { OrderStatus } from "@prisma/client";
import prisma from "../utils/prisma";
import { GetOrderInput } from "./order.schema";

/**
 * Get Order Input
 * @param data contains customerId and status that seperate by comma
 * @returns order arary
 */
export async function getOrderStatus(
  data: GetOrderInput & { customerId: number }
) {
  const { customerId, status } = data;
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
      customerId,
      status: {
        in: statusArr,
      },
    },
  });
}
