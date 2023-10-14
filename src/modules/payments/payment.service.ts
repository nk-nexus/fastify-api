import { OrderStatus, PaymentStatus } from "@prisma/client";
import prisma from "../../utils/prisma";
import { CreatePaymentBody } from "./payment.schema";
import { Decimal } from "@prisma/client/runtime/library";

export async function createPayment(data: CreatePaymentBody) {
  const { orderId, amount, ...rest } = data;

  let currentAmount = new Decimal(amount);
  const payments = await prisma.payments.findMany({ where: { orderId } });
  payments.forEach(({ amount: total }) => {
    currentAmount = Decimal.add(currentAmount, total)
  });

  let order = await prisma.orders.findFirst({
    where: {
      id: orderId,
      status: OrderStatus.ORDERED,
      deletedAt: null,
    },
  });
  if (!order) {
    throw new Error('Not found order')
  }

  order = await prisma.orders.update({
    where: {
      id: orderId,
      status: OrderStatus.ORDERED,
      deletedAt: null,
    },
    data: {
      status:
        currentAmount.toNumber() < order.amount.toNumber()
          ? OrderStatus.ORDERED
          : OrderStatus.PURCHASED,
    },
  });

  return prisma.payments.create({
    data: {
      ...rest,
      amount,
      orderId,
      status:
        currentAmount.toNumber() < order.amount.toNumber()
          ? PaymentStatus.PENDING
          : PaymentStatus.SUCCESSFUL,
    },
  });
}
