import { FastifyReply, FastifyRequest } from "fastify";
import fjwt from "@fastify/jwt";
import { UserRole } from "@prisma/client";

interface IAuthRegistration {
  jwt: unknown;
  register(item: unknown, opt: unknown): unknown;
  decorate: (label: string, fn: unknown) => void;
  addHook: (
    label: string,
    fn: (req: { jwt: unknown }, res: unknown, next: () => void) => void,
  ) => void;
}

export default function authRegistrations<T extends IAuthRegistration>(server: T) {
  const jwtSecret = process.env.JWT_SECRET || "";

  // register fastify jwt with secret
  server.register(fjwt, {
    secret: jwtSecret,
  });

  // adding custom decorators to protect some routes
  server.decorate(
    "authenticate",
    async (request: FastifyRequest, reply: FastifyReply) => {
      await request.jwtVerify();
    }
  );

  // adding custom decorators to protect some routes
  server.decorate(
    "authorize",
    async (request: FastifyRequest, reply: FastifyReply) => {
      const user = request.user;
      if (user.role === UserRole.CUSTOMER) {
        throw new Error("Unauthorized");
      }
    }
  );

  // inject jwt data into request
  server.addHook("preHandler", (req, reply, next) => {
    req.jwt = server.jwt;
    return next();
  });
}
