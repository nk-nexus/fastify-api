import { buildJsonSchemas } from "fastify-zod";
import { z } from "zod";
import { replyRegisterUserSchema } from "../user/user.schema";
import { OrderStatus } from "@prisma/client";

/**
 * ==============================================
 *  CUSTOM ORDER SCHEMA
 * ==============================================
 */

const orderGenerateSchema = {
  id: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
};

const orderOwnerSchema = {
  userId: z.number(),
  user: replyRegisterUserSchema,
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

// Create Interested Order Request Schema
const requestCreateInterestedOrderSchema = z.object({
    details: z.string(),
    productIds: z.array(z.number()).nonempty()
})

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
    ...orderGenerateSchema,
    ...orderOwnerSchema,
  })
);

const replyCreateInterestedOrderSchema = z.object({
  details: z.string(),
  status: z.nativeEnum(OrderStatus),
  total: z.number().min(0),
  ...orderGenerateSchema,
  ...orderOwnerSchema,
})

/**
 * ==============================================
 *  ORDER INPUT TYPE & BUILD JSON SCHEMAS
 * ==============================================
 */

// Get Order Status Input Type
export type GetOrderInput = z.infer<typeof getOrderStatusReqeustSchema>;
export type CreateInterestOrderInput = z.infer<typeof requestCreateInterestedOrderSchema>;

// Build Order Schemas
export const { schemas: orderSchemas, $ref } = buildJsonSchemas(
  {
    getOrderStatusReqeustSchema,
    getOrderStatusReplySchema,
    requestCreateInterestedOrderSchema,
    replyCreateInterestedOrderSchema
  },
  { $id: "order" }
);
