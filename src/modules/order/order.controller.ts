import { FastifyReply, FastifyRequest } from "fastify";
import {
  CreateInterestOrderInput,
  DeleteOrderItemsInput,
  GetOrderInput,
  OrderIdInput,
} from "./order.schema";
import {
  cancelOrder,
  createInterestedOrder,
  deleteOrderItems,
  getOrderStatus,
} from "./order.service";

export async function getOrderStatusHandler(
  request: FastifyRequest<{ Querystring: GetOrderInput }>,
  reply: FastifyReply
) {
  const { status } = request.query;
  const { id } = request.user;

  const orders = await getOrderStatus({ ownerId: id, status });
  return reply.code(200).send(orders);
}

export async function createInterestedOrderHandler(
  request: FastifyRequest<{ Body: CreateInterestOrderInput }>,
  reply: FastifyReply
) {
  const { id: ownerId } = request.user;
  const { body } = request;

  const order = await createInterestedOrder({
    ...body,
    ownerId,
  });
  return reply.code(200).send(order);
}

export async function cancelOrderHandler(
  request: FastifyRequest<{
    Params: OrderIdInput;
  }>,
  reply: FastifyReply
) {
  const {
    params: { orderId },
    user,
  } = request;
  const order = await cancelOrder({
    orderId: parseInt(orderId),
    ownerId: user.id,
  });
  return reply.code(200).send(order);
}

export async function deleteOrderItemsHandler(
  request: FastifyRequest<{
    Params: OrderIdInput;
    Body: DeleteOrderItemsInput;
  }>,
  reply: FastifyReply
) {
  const {
    params: { orderId },
    body,
    user,
  } = request;
  const order = await deleteOrderItems({
    orderId: parseInt(orderId),
    ownerId: user.id,
    ...body,
  });
  return reply.code(200).send(order);
}
