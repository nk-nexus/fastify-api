import { FastifyInstance } from "fastify";
import { getOrderStatusHandler } from "./order.controller";
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

/**
 * ==============================================
 *  Order Routes
 * ==============================================
 */

async function orderRoutes(server: FastifyInstance) {
  // Get Order by Status
  server.get("/", getOrderStatusOpts(server), getOrderStatusHandler);
}

export default orderRoutes;
