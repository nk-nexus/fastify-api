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
 * @returns product array with total stock
 */
export async function getProductHandler(
  request: FastifyRequest<{ Querystring: GetProductInput }>,
  reply: FastifyReply
) {
  const products = await getProductPagination(request.query);
  return reply.code(200).send(products);
}

/**
 * Create Product Handler
 * @returns a created product
 */
export async function createProductHandler(
  request: FastifyRequest<{ Body: CreateProductInput }>,
  reply: FastifyReply
) {
  const total = await createProduct(request.body);
  return reply.code(201).send({ totalCreated: total.count });
}

/**
 * Update Product Details
 * @returns a updated product
 */
export async function updateProductDetailsHandler(
  request: FastifyRequest<{
    Params: ProductIdInput;
    Body: UpdateProductDetailsInput;
  }>,
  reply: FastifyReply
) {
  const { params: { productId }, body } = request;
  const product = await updateProductDetails({
    productId,
    ...body,
  });
  return reply.code(200).send(product);
}

/**
 * Update Product Purchasable
 * @return a updated product
 */
export async function updateProductPurchasableHandler(
  request: FastifyRequest<{
    Params: ProductIdInput;
    Querystring: UpdateProductPurchasableInput;
  }>,
  reply: FastifyReply
) {
  const { query: { status }, params: { productId } } = request;
  const product = await updateProductPurchasable({
    productId,
    status,
  });
  return reply.code(200).send(product);
}
