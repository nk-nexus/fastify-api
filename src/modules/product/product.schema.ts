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
 *  CUSTOMER PRODUCT SCHEMA
 * ==============================================
 */

const customerProductInput = {
  name: z.string(),
  brand: z.string(),
  vendor: z.string(),
  type: z.nativeEnum(ProductType),
  price: z.number().min(0),
  tags: z.string(),
  details: z.string(),
  purchasable: z.boolean(),
};

const customerProductGenerate = {
  id: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
  inStock: z.number().optional(),
};

/**
 * ==============================================
 *  PRODUCT REQUEST & RESPONSE SCHEMA
 * ==============================================
 */

// get product with querystring filter request
const productFilterSchema = z.object({
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

// create product request
const createProductReqSchema = z.object(customerProductInput);

const createProductResSchema = z.object({
  ...customerProductGenerate,
  ...customerProductInput,
});

const filterProductResSchema = z.array(createProductResSchema);

/**
 * ==============================================
 *  PRODUCT INPUT TYPE & BUILD JSON SCHEMAS
 * ==============================================
 */

/** Request qeurystring type for Get Product  */
export type GetProductFilter = z.infer<typeof productFilterSchema>;
// create product input type
export type CreateProductInput = z.infer<typeof createProductReqSchema>;

/** Build Product Schemas */
export const { schemas: productSchemas, $ref } = buildJsonSchemas(
  {
    productFilterSchema,
    createProductResSchema,
    createProductReqSchema,
    filterProductResSchema,
  },
  { $id: "product" }
);
