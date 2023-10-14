import { PaymentStatus } from "@prisma/client";
import { buildJsonSchemas } from "fastify-zod";
import { z } from "zod";

/**
 * ==============================================
 *  CUSTOM PRODUCT SCHEMA
 * ==============================================
 */

const paymentGenerateSchema = {
  id: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
};

/**
 * ==============================================
 *  PAYMENT REQUEST SCHEMA
 * ==============================================
 */

const requestCreatePaymentSchema = z.object({
  amount: z.string().regex(/^\d+(\.\d{1,2})?$/),
  orderId: z.number(),
  method: z.string(),
  date: z.date(),
});

/**
 * ==============================================
 *  PAYMENT REPLY SCHEMA
 * ==============================================
 */

const replyCreatePaymentSchema = z.object({
  anount: z.number(),
  orderId: z.number(),
  method: z.string(),
  date: z.date(),
  status: z.nativeEnum(PaymentStatus),
  ...paymentGenerateSchema,
});

/**
 * ==============================================
 *  PAYMENT INPUT TYPE & BUILD JSON SCHEMAS
 * ==============================================
 */

export type CreatePaymentBody = z.infer<typeof requestCreatePaymentSchema>;

// Build Payment Schemas
export const { schemas: paymentSchemas, $ref } = buildJsonSchemas(
  {
    requestCreatePaymentSchema,
    replyCreatePaymentSchema,
  },
  { $id: "payment" }
);
