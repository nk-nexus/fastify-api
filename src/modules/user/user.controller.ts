import { FastifyRequest, FastifyReply } from "fastify";
import { verifyPassword } from "../../utils/hash";
import { RegisterUserInput, LoginUserInput } from "./user.schema";
import { findUserByEmail, registerUser } from "./user.service";

/**
 * Register User Handler
 * @returns the registered user
 */
export async function registerUserHandler(
  request: FastifyRequest<{ Body: RegisterUserInput }>,
  reply: FastifyReply
) {
  const user = await registerUser(request.body);
  return reply.code(201).send(user);
}

/**
 * Login User Handler
 * @returns jwt access token
 */
export async function loginUserHandler(
  request: FastifyRequest<{ Body: LoginUserInput }>,
  reply: FastifyReply
) {
  const { email, password } = request.body;

  // find a user by email
  const user = await findUserByEmail(email);

  if (user) {
    // verify password
    const correctPassword = verifyPassword({
      candidatePassword: password,
      salt: user.salt,
      hash: user.password,
    });

    if (correctPassword) {
      // generate access token
      return { accessToken: request.jwt.sign({ id: user.id, role: user.role }) };
    }
  }

  return reply.code(401).send({
    message: "Invalid email or password",
  });
}
