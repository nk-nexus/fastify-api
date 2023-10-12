import { FastifyReply, FastifyRequest } from "fastify";
import { CreateInterestOrderInput, GetOrderInput } from "./order.schema";
import { createInterestedOrder, getOrderStatus } from "./order.service";

export async function getOrderStatusHandler(
  request: FastifyRequest<{ Querystring: GetOrderInput }>,
  reply: FastifyReply
) {
  const { status } = request.query;
  const { id } = request.user;

  try {
    const orders = await getOrderStatus({ ownerId: id, status });
    return reply.code(200).send(orders);
  } catch (error) {
    return reply.code(500).send(error);
  }
}

export async function createInterestedOrderHandler(
  request: FastifyRequest<{ Body: CreateInterestOrderInput }>,
  reply: FastifyReply,
) {
  const { id: ownerId } = request.user
  const { body } = request
  
  try {
    const order = await createInterestedOrder({
      ...body,
      ownerId,
    })
    return reply.code(200).send(order)
  } catch (error) {
    return reply.code(500).send(error)
  }
}