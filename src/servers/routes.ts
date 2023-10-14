import { FastifyTypeProviderDefault, RouteShorthandMethod } from "fastify";
import { Http2SecureServer, Http2ServerRequest, Http2ServerResponse } from "http2";

import userRoutes from "../modules/users/user.route";
import productRoutes from "../modules/products/product.route";
import orderRoutes from "../modules/orders/order.route";
import stockRoutes from "../modules/stocks/stock.route";
import paymentRoutes from "../modules/payments/payment.route";
import { orderSchemas } from "../modules/orders/order.schema";
import { paymentSchemas } from "../modules/payments/payment.schema";
import { productSchemas } from "../modules/products/product.schema";
import { stockSchemas } from "../modules/stocks/stock.schema";
import { userSchemas } from "../modules/users/user.schema";

interface IRouteRegistration {
  get: RouteShorthandMethod<Http2SecureServer, Http2ServerRequest, Http2ServerResponse, FastifyTypeProviderDefault>,
  addSchema(schema: unknown): unknown,
  register(route: unknown, opt: unknown): unknown
}

export default function routeRegistrations<T extends IRouteRegistration>(server: T) {
  // Add check health server status
  server.get("/healthz", function () {
    return { status: "OK" };
  });

  /**
   * Add Schemas
   */
  for (const schema of [
    ...userSchemas,
    ...productSchemas,
    ...orderSchemas,
    ...stockSchemas,
    ...paymentSchemas,
  ]) {
    server.addSchema(schema);
  }
  
  /**
   * Register Routes and Set Prefix
   */   
  server.register(userRoutes, { prefix: "api/users" });
  server.register(productRoutes, { prefix: "api/products" });
  server.register(orderRoutes, { prefix: "api/orders" });
  server.register(stockRoutes, { prefix: "api/stocks" });
  server.register(paymentRoutes, { prefix: "api/payments" });
}
