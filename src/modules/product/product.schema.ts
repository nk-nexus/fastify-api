import { buildJsonSchemas } from "fastify-zod";
import { z } from "zod";
import { pagination } from "../utils/validate";

/**
 * ==============================================
 *  PRODUCT ENUM TYPE
 * ==============================================
 */

export enum ProductType {
  CPU = "CPU",
  GPU = "GPU",
  RAM = "RAM",
  M2 = "M2",
  SSD = "SSD",
  HDD = "HDD",
  MOTHERBOARD = "MOTHERBOARD",
  POWER_SUPPLY = "POWER_SUPPLY",
  UPS = "UPS",
  MONITOR = "MONITOR",
  CASE = "CASE",
}

/**
 * ==============================================
 *  CUSTOM PRODUCT SCHEMA
 * ==============================================
 */

const customProductInput = {
  name: z.string(),
  brand: z.string(),
  vendor: z.string(),
  type: z.nativeEnum(ProductType),
  price: z.number().min(0),
  tags: z.string(),
  details: z.string(),
  purchasable: z.boolean(),
};

const customProductGenerate = {
  id: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
  inStock: z.number().optional(),
};

const customProductDetails = {
  name: z.string().optional(),
  brand: z.string().optional(),
  vendor: z.string().optional(),
  type: z.nativeEnum(ProductType).optional(),
  price: z.number().min(0).optional(),
  tags: z.string().optional(),
  details: z.string().optional(),
};

/**
 * ==============================================
 *  PRODUCT REQUEST SCHEMA
 * ==============================================
 */

// Get Product Request Schema
const getProductRequestSchema = z.object({
  ...pagination,
  type: z.nativeEnum(ProductType).optional(),
  text: z
    .string()
    .regex(/^[a-zA-Z0-9\s\-_]+$/)
    .optional(),
  tags: z
    .string()
    .regex(/^[a-zA-Z0-9\s\-_]+(?:,\s*[a-zA-Z0-9\s\-_]+)*$/)
    .optional(),
});

// Create Product Request Schema
const createProductRequestSchema = z.object(customProductInput);

// Update Product Details Request Schema
const updateProductDetailsRequestSchema = z.object(customProductDetails);

// Update Product Purchasable Request Schema
const updateProductPurchasableRequestSchema = z.object({
  status: z.enum(["y", "n"]),
});

// Product Param Id Schema
const productIdShcema = z.object({
  productId: z
    .string()
    .regex(/^\d+$/),
});

/**
 * ==============================================
 *  PRODUCT REPLAY SCHEMA
 * ==============================================
 */

// Create Product Reply Schema
const createProductReplySchema = z.object({
  ...customProductGenerate,
  ...customProductInput,
});

// Get Product Reply Schema
const getProductReplaySchema = z.array(createProductReplySchema);

// Update Product Details Reply Schema
const updateProductDetailsReplySchema = z.object({
  ...customProductGenerate,
  ...customProductDetails,
});

// Update Product Purchasable Reply schema
const updateProductPurchasableReplySchema = z.object({
  ...customProductGenerate,
  name: z.string(),
  purchasable: z.boolean(),
});

/**
 * ==============================================
 *  PRODUCT INPUT TYPE & BUILD JSON SCHEMAS
 * ==============================================
 */

// Product Id Input type
export type ProductIdInput = z.infer<typeof productIdShcema>;
// Get Product Input Type
export type GetProductInput = z.infer<typeof getProductRequestSchema>;
// Create Product Input Type
export type CreateProductInput = z.infer<typeof createProductRequestSchema>;
// Update Product Details Input Type
export type UpdateProductDetailsInput = z.infer<
  typeof updateProductDetailsRequestSchema
>;
// Update Prodcut Purchasable Input Type
export type UpdateProductPurchasableInput = z.infer<
  typeof updateProductPurchasableRequestSchema
>;

// Build Product Schemas
export const { schemas: productSchemas, $ref } = buildJsonSchemas(
  {
    productIdShcema,
    getProductRequestSchema,
    createProductRequestSchema,
    updateProductDetailsRequestSchema,
    updateProductPurchasableRequestSchema,
    createProductReplySchema,
    getProductReplaySchema,
    updateProductDetailsReplySchema,
    updateProductPurchasableReplySchema,
  },
  { $id: "product" }
);
