import { FastifyInstance } from "fastify";
import { createProductHandler, getProductHandler } from "./product.controller";
import { $ref } from "./product.schema";

async function productRoutes(server: FastifyInstance) {
  server.get(
    "/",
    {
      schema: {
        querystring: $ref("productFilterSchema"),
        response: {
          200: $ref("filterProductResSchema"),
        },
      },
    },
    getProductHandler
  );

  server.post(
    "/",
    {
      preHandler: [server.authenticate],
      schema: {
        body: $ref("createProductReqSchema"),
        response: {
          201: $ref("createProductReqSchema"),
        },
      },
    },
    createProductHandler
  );
}

export default productRoutes;
