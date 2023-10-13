import Fastify, { FastifyRequest, FastifyReply } from "fastify";
import fjwt, { JWT } from "@fastify/jwt";
import fs from "fs";
import pino from "pino";
import { userSchemas } from "./modules/user/user.schema";
import userRoutes from "./modules/user/user.route";
import productRoutes from "./modules/product/product.route";
import { productSchemas } from "./modules/product/product.schema";
import orderRoutes from "./modules/order/order.route";
import { orderSchemas } from "./modules/order/order.schema";
import stockRoutes from "./modules/stocks/stock.route";
import { stockSchemas } from "./modules/stocks/stock.schema";
import { UserRole } from "@prisma/client";

declare module "fastify" {
  interface FastifyRequest {
    jwt: JWT;
  }
  export interface FastifyInstance {
    authenticate: any;
    authorize: any;
  }
}

declare module "@fastify/jwt" {
  interface FastifyJWT {
    user: {
      id: number;
      role: UserRole;
    };
  }
}

function buildServer() {
  const jwtSecret = process.env.JWT_SECRET || "";

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

  // register fastify jwt with secret
  server.register(fjwt, {
    secret: jwtSecret,
  });

  // adding custom decorators to protect some routes
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

  // add check health server status
  server.get("/healthz", function () {
    return { status: "OK" };
  });

  // inject jwt data into request
  server.addHook("preHandler", (req, reply, next) => {
    req.jwt = server.jwt;
    return next();
  });

  // Register the onError hook
  server.addHook("onError", (request, reply, error, done) => {
    if (error.message.includes("Unauthorized")) {
      reply.code(401).send({
        error: "Unauthorized",
        message: error.message,
      });
    } else if (
      error.message.includes("does not exist") ||
      error.message.includes("not found")
    ) {
      reply.code(404).send({
        error: "Not Found",
        message: error.message,
      });
    } else {
      // Send a custom error response to the client
      reply.code(500).send({
        error: "Internal Server Error",
        message: error.message,
      });
    }
    // Finish the request-response cycle
    done();
  });

  // add schema into server
  for (const schema of [
    ...userSchemas,
    ...productSchemas,
    ...orderSchemas,
    ...stockSchemas,
  ]) {
    server.addSchema(schema);
  }

  // add routes into server
  server.register(userRoutes, { prefix: "api/users" });
  server.register(productRoutes, { prefix: "api/products" });
  server.register(orderRoutes, { prefix: "api/orders" });
  server.register(stockRoutes, { prefix: "api/stocks" });

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

  return server;
}

export default buildServer;
