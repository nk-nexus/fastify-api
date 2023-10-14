import { FastifyInstance } from "fastify";
import {
  addOrderItemsHandler,
  cancelOrderHandler,
  completeOrderHandler,
  confirmOrderHandler,
  createInterestedOrderHandler,
  deleteOrderItemsHandler,
  getOrderStatusHandler,
} from "./order.controller";
import { $ref } from "./order.schema";

/**
 * ==============================================
 *  ROUTE SHORTHAND OPTIONS
 * ==============================================
 */

const getOrderStatusOpts = (server: FastifyInstance) => ({
  preHandler: [server.authenticate],
  schema: {
    querystring: $ref("requestGetOrderSchema"),
    response: {
      200: $ref("replyGetOrderSchema"),
    },
  },
});

const createInterestedOrderOpts = (server: FastifyInstance) => ({
  preHandler: [server.authenticate],
  schema: {
    body: $ref("requestCreateInterestedOrderSchema"),
    response: {
      201: $ref("replyCreateInterestedOrderSchema"),
    },
  },
});

const updateOrderOpts = (server: FastifyInstance) => ({
  preHandler: [server.authenticate],
  schema: {
    params: $ref("orderIdSchema"),
    querystring: $ref("requestUpdateOrderSchema"),
    response: {
      200: $ref("replyUpdateOrderSchema"),
    },
  },
});

const addOrderItemsOpts = (server: FastifyInstance) => ({
  preHandler: [server.authenticate],
  schema: {
    params: $ref("orderIdSchema"),
    body: $ref("requestAddOrderItemsSchema"),
    response: {
      201: $ref("replyUpsertOrderItemsSchema"),
    },
  },
});

const deleteOrderItemsOpts = (server: FastifyInstance) => ({
  preHandler: [server.authenticate],
  schema: {
    params: $ref("orderIdSchema"),
    body: $ref("requestDeleteOrderItemsSchema"),
    response: {
      200: $ref("replyUpsertOrderItemsSchema"),
    },
  },
});

/**
 * ==============================================
 *  Order Routes
 * ==============================================
 */

async function orderRoutes(server: FastifyInstance) {
  // Get Order by Status
  server.get("/", getOrderStatusOpts(server), getOrderStatusHandler);
  // Create Order with Status Intested
  server.post(
    "/",
    createInterestedOrderOpts(server),
    createInterestedOrderHandler
  );
  // Add Order Items
  server.post(
    "/:orderId/items",
    addOrderItemsOpts(server),
    addOrderItemsHandler
  );
  // Confirm Order (can cancel only order status = ORDERED)
  server.patch(
    "/:orderId/confirm",
    updateOrderOpts(server),
    confirmOrderHandler
  );
  // Complete Order
  server.patch(
    "/:orderId/complete",
    updateOrderOpts(server),
    completeOrderHandler
  );
  // Cancel Order (can cancel only order status in [ORDERED,PURCHASE])
  server.patch("/:orderId/cancel", updateOrderOpts(server), cancelOrderHandler);
  // Delete Order Items (can delete only order status = "INTERESTED")
  server.delete(
    "/:orderId/items",
    deleteOrderItemsOpts(server),
    deleteOrderItemsHandler
  );
}

export default orderRoutes;
