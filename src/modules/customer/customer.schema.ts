import { buildJsonSchemas } from "fastify-zod";
import { z } from "zod";

/**
 * customer core schema
 */
const customerCore = {
  email: z
    .string({
      required_error: "Email is required",
      invalid_type_error: "Email must be a string",
    })
    .email(),
  name: z.string(),
};

/**
 * request body for Register
 */
const createCustomerSchema = z.object({
  ...customerCore,
  password: z.string({
    required_error: "Password is required",
    invalid_type_error: "Password must be a string",
  }),
});

/**
 * response data for Register
 */
const createCustomerResponseSchema = z.object({
  id: z.number(),
  ...customerCore,
});

/**
 * request body for Login
 */
const loginSchema = z.object({
  email: z
    .string({
      required_error: "Email is required",
      invalid_type_error: "Email must be a string",
    })
    .email(),
  password: z
    .string({
      required_error: "Password is required",
      invalid_type_error: "Password must be a string",
    })
    .min(8),
});

/**
 * response data for Login 
 */
const loginResponseSchema = z.object({
  accessToken: z.string(),
});

/** Request body type for Register */
export type CreateCustomerInput = z.infer<typeof createCustomerSchema>;
/** Request body type for Login  */
export type LoginInput = z.infer<typeof loginSchema>;

/** Build Customer Schemas */
export const { schemas: customerSchemas, $ref } = buildJsonSchemas({
  createCustomerSchema,
  createCustomerResponseSchema,
  loginResponseSchema,
  loginSchema,
});
