import { FastifyReply, FastifyRequest } from "fastify";
import { GetOrderInput } from "./order.schema";
import { getOrderStatus } from "./order.service";

export async function getOrderStatusHandler(
  request: FastifyRequest<{ Querystring: GetOrderInput }>,
  reply: FastifyReply
) {
  const { status } = request.query;
  const { id } = request.user;

  try {
    const orders = await getOrderStatus({ customerId: id, status });
    return reply.code(200).send(orders);
  } catch (error) {
    return reply.code(500).send(error);
  }
}
