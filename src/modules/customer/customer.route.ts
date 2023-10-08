import { FastifyInstance } from "fastify";
import { loginHandler, registerCustomerHandler } from "./customer.controller";
import { $ref } from "./customer.schema";

async function customerRoutes(server: FastifyInstance) {
  server.post(
    "/register",
    {
      schema: {
        body: $ref("createCustomerSchema"),
        response: {
          201: $ref("createCustomerResponseSchema"),
        },
      },
    },
    registerCustomerHandler
  );

  server.post(
    "/login",
    {
      schema: {
        body: $ref("loginSchema"),
        response: {
          200: $ref("loginResponseSchema"),
        },
      },
    },
    loginHandler
  );
}

export default customerRoutes;
