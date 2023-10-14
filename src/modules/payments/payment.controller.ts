import { FastifyRequest, FastifyReply } from "fastify";
import { CreatePaymentBody } from "./payment.schema";
import { createPayment } from "./payment.service";

export async function createPaymentHandler(
  request: FastifyRequest<{ Body: CreatePaymentBody }>,
  reply: FastifyReply
) {
  const { body } = request;
  const payment = await createPayment(body);
  return reply.code(201).send(payment);
}
