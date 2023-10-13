import { FastifyInstance } from "fastify";
import {
  createProductHandler,
  getProductHandler,
  updateProductDetailsHandler,
  updateProductPurchasableHandler,
} from "./product.controller";
import { $ref } from "./product.schema";

/**
 * ==============================================
 *  ROUTE SHORTHAND OPTIONS
 * ==============================================
 */

// Get Product Shorthand Options
const getProductOpts = {
  schema: {
    querystring: $ref("getProductRequestSchema"),
    response: {
      200: $ref("replayGetProductSchema"),
    },
  },
};

// Create Product Shorthand Options
const createProductOpts = (server: FastifyInstance) => ({
  preHandler: [server.authenticate, server.authorize],
  schema: {
    body: $ref("requestCreateProductSchema"),
    response: {
      201: $ref("replyCreateProductSchema"),
    },
  },
});

// Update Product Details Shorthan Options
const updateProductDetailsOpts = (server: FastifyInstance) => ({
  preHandler: [server.authenticate, server.authorize],
  schema: {
    params: $ref("productIdShcema"),
    body: $ref("updateProductDetailsRequestSchema"),
    response: {
      200: $ref("updateProductDetailsReplySchema"),
    },
  },
});

// Update Product Purchasable Shorthan Options
const updateProductPurchasableOpts = (server: FastifyInstance) => ({
  preHandler: [server.authenticate, server.authorize],
  schema: {
    params: $ref("productIdShcema"),
    querystring: $ref("updateProductPurchasableRequestSchema"),
    response: {
      200: $ref("updateProductPurchasableReplySchema"),
    },
  },
});

/**
 * ==============================================
 *  Product Routes
 * ==============================================
 */

async function productRoutes(server: FastifyInstance) {
  // Get Product With Querystring Filter
  server.get("/", getProductOpts, getProductHandler);
  // Create Product
  server.post("/", createProductOpts(server), createProductHandler);
  // Update Product Details
  server.patch(
    "/:productId",
    updateProductDetailsOpts(server),
    updateProductDetailsHandler
  );
  // Update Product Purchasable
  server.patch(
    "/:productId/purchasable",
    updateProductPurchasableOpts(server),
    updateProductPurchasableHandler
  );
}

export default productRoutes;
