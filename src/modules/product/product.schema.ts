import { buildJsonSchemas } from "fastify-zod";
import { z } from "zod";
import { pagination } from "../utils/validate";

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
 * request querystring for Get Product
 */
const productFilterSchema = z.object({
  ...pagination,
  type: z.nativeEnum(ProductType).optional(),
  text: z
    .string()
    .regex(/^[a-zA-Z0-9\s-_]+$ /)
    .optional(),
  tags: z
    .string()
    .regex(/^[a-zA-Z0-9\s-_]+(?:,\s*[a-zA-Z0-9\s-_]+)*$/)
    .optional(),
});

/**
 * response data for Get Product
 */
const productFilterResponseSchema = z.object({
  id: z.number(),
  name: z.string(),
  brand: z.string(),
  vendor: z.string(),
  type: z.nativeEnum(ProductType),
  price: z.number(),
  tags: z.string(),
  details: z.object({}),
  purchasable: z.boolean(),
  inStock: z.number(),
});

/** Request qeurystring type for Get Product  */
export type GetProductFilter = z.infer<typeof productFilterSchema>;

/** Build Product Schemas */
export const { schemas: productSchemas, $ref } = buildJsonSchemas({
  productFilterSchema,
  productFilterResponseSchema,
});
