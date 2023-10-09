import { FastifyReply, FastifyRequest } from "fastify";
import { CreateStockItemsInput } from "./stock.schema";
import { createStockItems } from "./stock.service";

/**
 * Create Stock Items handler
 * @returns sent status 201 when success or 500 when fail
 */
export async function createStockItemsHandler(
  request: FastifyRequest<{ Body: CreateStockItemsInput }>,
  reply: FastifyReply
) {
  const body = request.body;

  try {
    const stockItems = await createStockItems(body);
    return reply.code(201).send(stockItems);
  } catch (error) {
    return reply.code(500).send(error);
  }
}
