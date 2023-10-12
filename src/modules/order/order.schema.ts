import { buildJsonSchemas } from "fastify-zod";
import { z } from "zod";
import { replyRegisterUserSchema } from "../user/user.schema";
import { OrderStatus } from "@prisma/client";
import { createProductReplySchema } from "../product/product.schema";

/**
 * ==============================================
 *  CUSTOM ORDER SCHEMA
 * ==============================================
 */

const orderGenerateSchema = {
  id: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().optional()
};

const orderOwnerSchema = {
  userId: z.number(),
  user: replyRegisterUserSchema,
};

const orderCoreSchema = {
  details: z.string(),
  status: z.nativeEnum(OrderStatus),
  total: z.number().min(0),
}

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

// Delete Order Items Request Schema
const requestDeleteOrderItemsSchema = z.object({
  orderItemIds: z.array(z.number())
})

// Find Order Input Schema
const orderInputSchema = z.object({
  ownerId: z.number(),
  orderId: z.number(),
})

// Order Param Id Schema
const orderIdSchema = z.object({
  orderId: z
    .string()
    .regex(/^\d+$/),
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
    ...orderGenerateSchema,
    ...orderOwnerSchema,
  })
);

// Create Interested Order Reply Schema 
const replyCreateInterestedOrderSchema = z.object({
  ...orderCoreSchema,
  ...orderGenerateSchema,
  ...orderOwnerSchema,
})

// Update Order Reply Schema
const replyUpdateOrderSchema = z.object({
  ...orderCoreSchema,
  ...orderGenerateSchema,
})

// Delete Order Items Reply Schema
const replyDeleteOrderItemsSchema = z.object({
  ...orderCoreSchema,
  ...orderGenerateSchema,
  orderItem: z.array(z.object({
    ...orderGenerateSchema,
    product: createProductReplySchema,
  }))
})

/**
 * ==============================================
 *  ORDER INPUT TYPE & BUILD JSON SCHEMAS
 * ==============================================
 */

// Get Order Status Input Type
export type OrderIdInput = z.infer<typeof orderIdSchema>;
export type FindOrderInput = z.infer<typeof orderInputSchema>;
export type GetOrderInput = z.infer<typeof getOrderStatusReqeustSchema>;
export type CreateInterestOrderInput = z.infer<typeof requestCreateInterestedOrderSchema>;
export type DeleteOrderItemsInput = z.infer<typeof requestDeleteOrderItemsSchema>;

// Build Order Schemas
export const { schemas: orderSchemas, $ref } = buildJsonSchemas(
  {
    orderIdSchema,
    getOrderStatusReqeustSchema,
    getOrderStatusReplySchema,
    requestCreateInterestedOrderSchema,
    replyCreateInterestedOrderSchema,
    requestDeleteOrderItemsSchema,
    replyDeleteOrderItemsSchema,
    replyUpdateOrderSchema,
  },
  { $id: "order" }
);
