import { FastifyInstance } from "fastify";
import { $ref } from "./payment.schema";
import { createPaymentHandler } from "./payment.controller";

const createPaymentOpts = (server: FastifyInstance) => ({
  preHandler: [server.authenticate, server.authorize],
  schema: {
    body: $ref("requestCreatePaymentSchema"),
    response: {
      200: $ref("replyCreatePaymentSchema"),
    },
  },
});

/**
 * ==============================================
 *  PAYMENT ROUTES
 * ==============================================
 */

async function paymentRoutes(server: FastifyInstance) {
  // Create Payment
  server.post("/", createPaymentOpts(server), createPaymentHandler);
}

export default paymentRoutes;
