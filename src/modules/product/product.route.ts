import { FastifyInstance } from "fastify";
import { getProductHandler } from "./product.controller";
import { $ref } from "./product.schema";

async function productRoutes(server: FastifyInstance) {
  server.get(
    "/",
    {
      schema: {
        querystring: $ref("productFilterSchema"),
        response: {
          200: $ref("productFilterResponseSchema"),
        },
      },
    },
    getProductHandler
  );
}

export default productRoutes;
