import { buildJsonSchemas } from "fastify-zod";
import { z } from "zod";

/**
 * ==============================================
 *  CUSTOM STOCK ITEMS SCHEMA
 * ==============================================
 */

const customStockItemCore = {
  details: z.string().optional(),
  productId: z.number(),
};

const customStockItemGenerate = {
  id: z.number().optional(),
  code: z.string().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  deletedAt: z.date().optional(),
};

/**
 * ==============================================
 *  STOCK REQUEST SCHEMA
 * ==============================================
 */

const createStockItemSchema = z.object(customStockItemCore);

const createStockItemsRequestSchema = z.array(createStockItemSchema).nonempty();

/**
 * ==============================================
 *  STOCK REPLAY SCHEMA
 * ==============================================
 */

const createStockItemsReplySchema = z.array(
  z.object({
    ...customStockItemCore,
    ...customStockItemGenerate,
  })
);

/**
 * ==============================================
 *  STOCK ITEMS INPUT TYPE & BUILD JSON SCHEMAS
 * ==============================================
 */

export type CreateStockItemsInput = z.infer<
  typeof createStockItemsRequestSchema
>;

// Build Stock Items Schemas
export const { schemas: stockSchemas, $ref } = buildJsonSchemas(
  {
    createStockItemsRequestSchema,
    createStockItemsReplySchema,
  },
  { $id: "stock-items" }
);
