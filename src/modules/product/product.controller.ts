import { FastifyReply, FastifyRequest } from "fastify";
import { CreateProductInput, GetProductFilter } from "./product.schema";
import { createProduct, getProductPagination } from "./product.service";

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

export async function createProductHandler(
  request: FastifyRequest<{ Body: CreateProductInput }>,
  reply: FastifyReply
) {
  const body = request.body;

  try {
    const product = await createProduct(body);
    return reply.code(201).send(product);
  } catch (error) {
    return reply.code(500).send(error);
  }
}
