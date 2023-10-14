import { FastifyInstance } from "fastify";
import { loginUserHandler, registerUserHandler } from "./user.controller";
import { $ref } from "./user.schema";

const registerUserOpts = {
  schema: {
    body: $ref("requestRegisterUserSchema"),
    response: {
      201: $ref("replyRegisterUserSchema"),
    },
  },
};

const loginUserOpts = {
  schema: {
    body: $ref("requestLoginUserSchema"),
    response: {
      200: $ref("replyLoginUserSchema"),
    },
  },
};

/**
 * ==============================================
 *  USER ROUTES
 * ==============================================
 */

async function userRoutes(server: FastifyInstance) {
  // Register User Route
  server.post("/register", registerUserOpts, registerUserHandler);
  // Login User Route
  server.post("/login", loginUserOpts, loginUserHandler);
}

export default userRoutes;
