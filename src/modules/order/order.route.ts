import { FastifyInstance } from "fastify";
import { createInterestedOrderHandler, getOrderStatusHandler } from "./order.controller";
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
    body: $ref('requestCreateInterestedOrderSchema'),
    response: {
      201: $ref('replyCreateInterestedOrderSchema'),
    },
  },
})

/**
 * ==============================================
 *  Order Routes
 * ==============================================
 */

async function orderRoutes(server: FastifyInstance) {
  // Get Order by Status
  server.get("/", getOrderStatusOpts(server), getOrderStatusHandler);
  // Create Order with Status Intested
  server.post("/", createInterestedOrderOpts(server), createInterestedOrderHandler)
}

export default orderRoutes;
