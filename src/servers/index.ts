import { JWT } from "@fastify/jwt";
import { UserRole } from "@prisma/client";
import Fastify  from "fastify";
import fs from "fs";
import pino from "pino";
import authRegistrations from "./auth";
import errorRegistrations from "./error";
import routeRegistrations from "./routes";

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
  // Create Fastifiy Server Instance
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

  // Register Authentication & Authorization
  authRegistrations(server);
  // Register Error Handler
  errorRegistrations(server);
  // Register Routes & Schemas
  routeRegistrations(server);

  return server;
}

export default buildServer;
