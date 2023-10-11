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

// export type Role = 'customer' | 'staff' | 'admin'

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
      // role: Role;
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

  // add check health server status
  server.get("/healthz", function () {
    return { status: "OK" };
  });

  // inject jwt data into request
  server.addHook("preHandler", (req, reply, next) => {
    req.jwt = server.jwt;
    return next();
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
