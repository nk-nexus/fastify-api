import { FastifyInstance } from "fastify";
import {
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
  // Delete Order Items (can delete only order status = "INTERESTED")
  server.delete(
    "/:orderId/items",
    deleteOrderItemsOpts(server),
    deleteOrderItemsHandler
  );
}

export default orderRoutes;
