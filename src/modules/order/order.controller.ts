import { FastifyReply, FastifyRequest } from "fastify";
import {
  CreateInterestOrderInput,
  DeleteOrderItemsInput,
  GetOrderInput,
  OrderIdInput,
} from "./order.schema";
import { createInterestedOrder, deleteOrderItems, getOrderStatus } from "./order.service";

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
  reply: FastifyReply
) {
  const { id: ownerId } = request.user;
  const { body } = request;

  try {
    const order = await createInterestedOrder({
      ...body,
      ownerId,
    });
    return reply.code(200).send(order);
  } catch (error) {
    return reply.code(500).send(error);
  }
}

export async function deleteOrderItemsHandler(
  request: FastifyRequest<{
    Params: OrderIdInput;
    Body: DeleteOrderItemsInput;
  }>,
  reply: FastifyReply
) {
  const { params: { orderId }, body, user } = request
  const order = await deleteOrderItems({
    orderId: parseInt(orderId),
    ownerId: user.id,
    ...body,
  });
  return reply.code(200).send(order)
}
