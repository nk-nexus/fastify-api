import { FastifyInstance } from "fastify";
import {
  cancelOrderHandler,
  createInterestedOrderHandler,
  deleteOrderItemsHandler,
  getOrderStatusHandler,
} from "./order.controller";
import { $ref } from "./order.schema";

/**
 * ==============================================
 *  ROUTE SHORTHAND OPTIONS
 * ==============================================
 */

const getOrderStatusOpts = (server: FastifyInstance) => ({
  preHandler: [server.authenticate],
  schema: {
    querystring: $ref("getOrderStatusReqeustSchema"),
    response: {
      200: $ref("getOrderStatusReplySchema"),
    },
  },
});

const createInterestedOrderOpts = (server: FastifyInstance) => ({
  preHandler: [server.authenticate],
  schema: {
    body: $ref("requestCreateInterestedOrderSchema"),
    response: {
      201: $ref("replyCreateInterestedOrderSchema"),
    },
  },
});

const cancelOrderOpts = (server: FastifyInstance) => ({
  preHandler: [server.authenticate],
  schema: {
    params: $ref("orderIdSchema"),
    response: {
      200: $ref("replyUpdateOrderSchema"),
    },
  },
});

const deleteOrderItemsOpts = (server: FastifyInstance) => ({
  preHandler: [server.authenticate, server.authorize],
  schema: {
    params: $ref("orderIdSchema"),
    body: $ref("requestDeleteOrderItemsSchema"),
    response: {
      200: $ref("replyDeleteOrderItemsSchema"),
    },
  },
});

/**
 * ==============================================
 *  Order Routes
 * ==============================================
 */

async function orderRoutes(server: FastifyInstance) {
  // Get Order by Status
  server.get("/", getOrderStatusOpts(server), getOrderStatusHandler);
  // Create Order with Status Intested
  server.post(
    "/",
    createInterestedOrderOpts(server),
    createInterestedOrderHandler
  );
  // Cancel Order (can cancel only order status = [ORDERED,PURCHASE])
  server.patch("/:orderId/cancel", cancelOrderOpts(server), cancelOrderHandler);
  // Delete Order Items (can delete only order status = "INTERESTED")
  server.delete(
    "/:orderId/items",
    deleteOrderItemsOpts(server),
    deleteOrderItemsHandler
  );
}

export default orderRoutes;
