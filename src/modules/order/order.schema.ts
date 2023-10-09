/**
 * ==============================================
 *  ORDER ENUM TYPE
 * ==============================================
 */

import { buildJsonSchemas } from "fastify-zod";
import { z } from "zod";
import { createCustomerResponseSchema } from "../customer/customer.schema";

export enum OrderStatus {
  INTERESTED = "INTERESTED",
  ORDERED = "ORDERED",
  PURCHASED = "PURCHASED",
  COMPLETED = "COMPLETED",
}

/**
 * ==============================================
 *  CUSTOM ORDER SCHEMA
 * ==============================================
 */
const customOrderGenerate = {
  id: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
};

const customOrderCustomer = {
  customerId: z.number(),
  customer: createCustomerResponseSchema,
};

/**
 * ==============================================
 *  ORDER REQUEST SCHEMA
 * ==============================================
 */

// Get Order Status Reqeust Schema
const getOrderStatusReqeustSchema = z.object({
  status: z.string().regex(/^(i|o|p|c)(?:,(i|o|p|c))*$/),
});

/**
 * ==============================================
 *  ORDER REPLAY SCHEMA
 * ==============================================
 */

// Get Order Status Reply Schema
const getOrderStatusReplySchema = z.array(
  z.object({
    details: z.string(),
    status: z.nativeEnum(OrderStatus),
    total: z.number().min(0),
    ...customOrderGenerate,
    ...customOrderCustomer,
  })
);

/**
 * ==============================================
 *  ORDER INPUT TYPE & BUILD JSON SCHEMAS
 * ==============================================
 */

// Get Order Status Input Type
export type GetOrderInput = z.infer<typeof getOrderStatusReqeustSchema>;

// Build Order Schemas
export const { schemas: orderSchemas, $ref } = buildJsonSchemas(
  {
    getOrderStatusReqeustSchema,
    getOrderStatusReplySchema,
  },
  { $id: "order" }
);
