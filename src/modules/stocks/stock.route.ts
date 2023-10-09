import { FastifyInstance } from "fastify";
import { createStockItemsHandler } from "./stock.controller";
import { $ref } from "./stock.schema";

/**
 * ==============================================
 *  ROUTE SHORTHAND OPTIONS
 * ==============================================
 */

const createStockItemsOpts = (server: FastifyInstance) => ({
  preHandler: [server.authenticate],
  schema: {
    body: $ref("createStockItemsRequestSchema"),
    response: {
      201: $ref("createStockItemsReplySchema"),
    },
  },
});

/**
 * ==============================================
 *  STOCK ITEMS ROUTES
 * ==============================================
 */

async function stockRoutes(server: FastifyInstance) {
  // Create Stock Items
  server.post("/", createStockItemsOpts(server), createStockItemsHandler);
}

export default stockRoutes;
