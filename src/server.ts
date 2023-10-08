import Fastify, { FastifyRequest, FastifyReply } from "fastify";
import fjwt, { JWT } from "@fastify/jwt";
import fs from "fs";
import pino from "pino";
import { customerSchemas } from "./modules/customer/customer.schema";
import customerRoutes from "./modules/customer/customer.route";
// import { withRefResolver } from "fastify-zod";
// import { version } from "../package.json";

declare module "fastify" {
  interface FastifyRequest {
    jwt: JWT;
  }
  export interface FastifyInstance {
    authenticate: any;
  }
}

declare module "@fastify/jwt" {
  interface FastifyJWT {
    user: {
      id: number;
      email: string;
      name: string;
    };
  }
}

function buildServer() {
  const server = Fastify({
    // http2 config
    http2: true,
    https: {
      key: fs.readFileSync("localhost-privkey.pem"),
      cert: fs.readFileSync("localhost-cert.pem"),
    },
    // logger with pino
    logger: pino({
      level: "info",
      prettyPrint: false,
    }),
  });

  server.register(fjwt, {
    secret: "ndkandnan78duy9sau87dbndsa89u7dsy789adb",
  });

  server.decorate(
    "authenticate",
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        await request.jwtVerify();
      } catch (e) {
        return reply.send(e);
      }
    }
  );

  server.get("/healthz", function () {
    return { status: "OK" };
  });

  server.addHook("preHandler", (req, reply, next) => {
    req.jwt = server.jwt;
    return next();
  });

  //   add schema into server
  for (const schema of [...customerSchemas]) {
    server.addSchema(schema);
  }

  //   server.register(
  //     swagger,
  //     withRefResolver({
  //       routePrefix: "/docs",
  //       exposeRoute: true,
  //       staticCSP: true,
  //       openapi: {
  //         info: {
  //           title: "Fastify API",
  //           description: "API for some products",
  //           version,
  //         },
  //       },
  //     })
  //   );

  server.register(customerRoutes, { prefix: "api/customers" });
  //   server.register(productRoutes, { prefix: "api/products" });

  return server;
}

export default buildServer;
