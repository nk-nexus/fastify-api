import { FastifyReply, FastifyRequest } from "fastify";
import {
  CreateProductInput,
  GetProductInput,
  ProductIdInput,
  UpdateProductDetailsInput,
  UpdateProductPurchasableInput,
} from "./product.schema";
import {
  createProduct,
  getProductPagination,
  updateProductDetails,
  updateProductPurchasable,
} from "./product.service";

/**
 * Get Product Handler
 * @param request only querystring
 * @param reply status 200 and 500
 * @returns product array with total stock
 */
export async function getProductHandler(
  request: FastifyRequest<{ Querystring: GetProductInput }>,
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

/**
 * Create Product Handler
 * @param request only body
 * @param reply status 201 and 500
 * @returns a created product
 */
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

export async function updateProductDetailsHandler(
  request: FastifyRequest<{
    Params: ProductIdInput;
    Body: UpdateProductDetailsInput;
  }>,
  reply: FastifyReply
) {
  const { productId } = request.params;
  const body = request.body;

  try {
    const product = await updateProductDetails({
      productId,
      ...body,
    });
    return reply.code(200).send(product);
  } catch (error) {
    return reply.code(500).send(500);
  }
}

/**
 * Update Product Purchasable
 * @param request both params and querystring
 * @param reply status 200 and 500
 * @return a updated product
 */
export async function updateProductPurchasableHandler(
  request: FastifyRequest<{
    Params: ProductIdInput;
    Querystring: UpdateProductPurchasableInput;
  }>,
  reply: FastifyReply
) {
  const { productId } = request.params;
  const { status } = request.query;

  try {
    const product = await updateProductPurchasable({
      productId,
      status,
    });
    return reply.code(200).send(product);
  } catch (error) {
    return reply.code(500).send(error);
  }
}
