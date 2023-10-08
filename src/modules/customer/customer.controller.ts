import { FastifyRequest, FastifyReply } from "fastify";
import { verifyPassword } from "../utils/hash";
import { CreateCustomerInput, LoginInput } from "./customer.schema";
import { createCustomer, findCustomerByEmail } from "./customer.service";

export async function registerCustomerHandler(
  request: FastifyRequest<{ Body: CreateCustomerInput }>,
  reply: FastifyReply
) {
  const body = request.body;

  try {
    const customer = await createCustomer(body);
    return reply.code(201).send(customer);
  } catch (error) {
    return reply.code(500).send(error);
  }
}

export async function loginHandler(
  request: FastifyRequest<{ Body: LoginInput }>,
  reply: FastifyReply
) {
  const body = request.body;

  // find a customer by email
  const customer = await findCustomerByEmail(body.email);

  if (!customer) {
    return reply.code(401).send({
      message: "Invalid email or password",
    });
  }

  // verify password
  const correctPassword = verifyPassword({
    candidatePassword: body.password,
    salt: customer.salt,
    hash: customer.password,
  });

  if (correctPassword) {
    const { password, salt, ...rest } = customer;
    // generate access token
    return { accessToken: request.jwt.sign(rest) };
  }

  return reply.code(401).send({
    message: "Invalid email or password",
  });
}
