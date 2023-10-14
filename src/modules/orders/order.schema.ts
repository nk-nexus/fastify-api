import { buildJsonSchemas } from "fastify-zod";
import { z } from "zod";
import { replyRegisterUserSchema } from "../users/user.schema";
import { OrderStatus } from "@prisma/client";
import { customProductGenerate, customProductInput } from "../products/product.schema";

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
  ownerId: z.number(),
  owner: replyRegisterUserSchema,
};

const orderCoreSchema = {
  details: z.string(),
  status: z.nativeEnum(OrderStatus),
  amount: z.number().min(0),
}

/**
 * ==============================================
 *  ORDER REQUEST SCHEMA
 * ==============================================
 */

// Get Order Status Reqeust Schema
const requestGetOrderSchema = z.object({
  status: z.string().regex(/^(i|o|p|c)(?:,(i|o|p|c))*$/),
});

// Create Interested Order Request Schema
const requestCreateInterestedOrderSchema = z.object({
    details: z.string(),
    productIds: z.array(z.number()).nonempty()
})

// Add Order Items Request Schema
const requestAddOrderItemsSchema = z.object({
  productIds: z.array(z.number()).nonempty()
})

// Delete Order Items Request Schema
const requestDeleteOrderItemsSchema = z.object({
  orderItemIds: z.array(z.number()).nonempty()
})

// Update Order Status Request Schema
const requestUpdateOrderSchema = z.object({
  status: z.enum([
    OrderStatus.COMPLETED,
    OrderStatus.PURCHASED,
    OrderStatus.ORDERED,
  ])
})

// Input Update Order 
const inputUpdateOrder = z.object({ 
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
const replyGetOrderSchema = z.array(
  z.object({
    ...orderGenerateSchema,
    ...orderCoreSchema,
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

// Add or Remove Order Items Reply Schema
const replyUpsertOrderItemsSchema = z.object({
  ...orderCoreSchema,
  ...orderGenerateSchema,
  orderItems: z.array(z.object({
    ...orderGenerateSchema,
    product: z.object({
      ...customProductGenerate,
      ...customProductInput,
    }),
  }))
})

/**
 * ==============================================
 *  ORDER INPUT TYPE & BUILD JSON SCHEMAS
 * ==============================================
 */

// Get Order Status Input Type
export type OrderIdParams = z.infer<typeof orderIdSchema>;
// Get Order Query
export type GetOrderQuery = z.infer<typeof requestGetOrderSchema>;
// Update Order Query
export type UpdateOrderQuery = z.infer<typeof requestUpdateOrderSchema>;
// Create Interest Order Body
export type CreateInterestOrderBody = z.infer<typeof requestCreateInterestedOrderSchema>;
// Add Order Items Body
export type AddOrderItemsBody = z.infer<typeof requestAddOrderItemsSchema>;
// Delete Order Items Body
export type DeleteOrderItemsBody = z.infer<typeof requestDeleteOrderItemsSchema>;
// Input Update Order
export type InputUpdateOrder = z.infer<typeof inputUpdateOrder>;
// Build Order Schemas
export const { schemas: orderSchemas, $ref } = buildJsonSchemas(
  {
    orderIdSchema,
    requestGetOrderSchema,
    replyGetOrderSchema,
    requestCreateInterestedOrderSchema,
    replyCreateInterestedOrderSchema,
    requestAddOrderItemsSchema,
    requestDeleteOrderItemsSchema,
    replyUpsertOrderItemsSchema,
    requestUpdateOrderSchema,
    replyUpdateOrderSchema,
  },
  { $id: "order" }
);
