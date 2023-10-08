import { FastifyReply, FastifyRequest } from "fastify";
import { GetProductFilter } from "./product.schema";
import { getProductPagination } from "./product.service";

export async function getProductHandler(
  request: FastifyRequest<{ Querystring: GetProductFilter }>,
  reply: FastifyReply
) {
  const query = request.query;

  try {
    const products = await getProductPagination(query);
    return reply.code(200).send(products);
  } catch (error) {
    return reply.code(500).send(error);
  }
}
