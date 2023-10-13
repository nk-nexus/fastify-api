import { FastifyReply, FastifyRequest } from "fastify";
import {
  CreateInterestOrderBody,
  DeleteOrderItemsBody,
  GetOrderQuery,
  OrderIdParams,
} from "./order.schema";
import {
  cancelOrder,
  completeOrder,
  confirmOrder,
  createInterestedOrder,
  deleteOrderItems,
  getOrderStatus,
  // purchaseOrder,
} from "./order.service";

export async function getOrderStatusHandler(
  request: FastifyRequest<{ Querystring: GetOrderQuery }>,
  reply: FastifyReply
) {
  const { status } = request.query;
  const { id } = request.user;

  const orders = await getOrderStatus({ ownerId: id, status });
  return reply.code(200).send(orders);
}

export async function createInterestedOrderHandler(
  request: FastifyRequest<{ Body: CreateInterestOrderBody }>,
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

export async function completeOrderHandler(
  request: FastifyRequest<{
    Params: OrderIdParams;
  }>,
  reply: FastifyReply
) {
  const { orderId } = request.params;
  const { user } = request;
  const order = await completeOrder({
    orderId: parseInt(orderId),
    ownerId: user.id,
  });
  return reply.code(200).send(order);
}

export async function confirmOrderHandler(
  request: FastifyRequest<{
    Params: OrderIdParams;
  }>,
  reply: FastifyReply
) {
  const { orderId } = request.params;
  const { user } = request;
  const order = await confirmOrder({
    orderId: parseInt(orderId),
    ownerId: user.id,
  });
  return reply.code(200).send(order);
}

export async function cancelOrderHandler(
  request: FastifyRequest<{
    Params: OrderIdParams;
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
    Params: OrderIdParams;
    Body: DeleteOrderItemsBody;
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
