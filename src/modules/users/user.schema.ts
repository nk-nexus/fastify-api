import { UserRole } from "@prisma/client";
import { buildJsonSchemas } from "fastify-zod";
import { z } from "zod";

/**
 * ==============================================
 *  USER SCHEMA
 * ==============================================
 */

const userCoreSchema = {
  email: z
    .string({
      required_error: "Email is required",
      invalid_type_error: "Email must be a string",
    })
    .email(),
  name: z.string(),
  phone: z.string().optional(),
  address: z.string().optional(),
};

const userGenerateSchema = {
  id: z.number(),
  role: z.nativeEnum(UserRole),
  createdAt: z.date(),
  updatedAt: z.date(),
}

/**
 * ==============================================
 *  USER REQUEST SCHEMA
 * ==============================================
 */

const requestRegisterUserSchema = z.object({
  ...userCoreSchema,
  password: z.string({
    required_error: "Password is required",
    invalid_type_error: "Password must be a string",
  }),
});

const requestLoginUserSchema = z.object({
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
 * ==============================================
 *  USER REPLAY SCHEMA
 * ==============================================
 */

export const replyRegisterUserSchema = z.object({
  ...userGenerateSchema,
  ...userCoreSchema,
});

const replyLoginUserSchema = z.object({
  accessToken: z.string(),
});

// Register User Input Type
export type RegisterUserInput = z.infer<typeof requestRegisterUserSchema>;
// Login User Input Type
export type LoginUserInput = z.infer<typeof requestLoginUserSchema>;

// Build User Schemas
export const { schemas: userSchemas, $ref } = buildJsonSchemas(
  {
    requestRegisterUserSchema,
    requestLoginUserSchema,
    replyRegisterUserSchema,
    replyLoginUserSchema
  },
  { $id: "user" }
);
