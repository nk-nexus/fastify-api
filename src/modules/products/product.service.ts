import prisma from "../../utils/prisma";
import {
  CreateProductInput,
  GetProductInput,
  ProductIdInput,
  UpdateProductDetailsInput,
  UpdateProductPurchasableInput,
} from "./product.schema";

/**
 * Get Procudt Pagination
 * @returns product array with total stock
 */
export async function getProductPagination(query: GetProductInput) {
  const { limit, page, text, type, tags } = query;

  let whereConditions: any = {};

  // filter by contains text in name column
  if (text) {
    whereConditions.name = {
      contains: text,
    };
  }
  // filter by equals type in type column
  if (type) {
    whereConditions.type = {
      equals: type,
    };
  }
  // filter by full-text search in tags column
  if (tags) {
    const regex = /[a-zA-Z0-9\s-]+/g;
    const tagArr = tags.match(regex);
    whereConditions.tags = {
      search: tagArr?.join(" | "),
    };
  }

  const products = await prisma.products.findMany({
    where: whereConditions,
    take: limit,
    skip: (page - 1) * limit,
  });

  return Promise.all(
    products.map(async ({ id, ...rest }) => {
      const inStock = await prisma.stockItems.count({
        where: { productId: id, deletedAt: null },
      });
      return { id, ...rest, inStock };
    })
  );
}

/**
 * Create Product
 * @returns a created product
 */
export async function createProduct(data: CreateProductInput) {
  return prisma.products.createMany({ data })
}

/**
 * Update Product Details
 * @returns a updated product
 */
export async function updateProductDetails(
  data: UpdateProductDetailsInput & ProductIdInput
) {
  const { productId: id, ...updateData } = data;
  return prisma.products.update({
    where: { id: parseInt(id) },
    data: updateData,
  });
}

/**
 * Updaate Product Purchasable
 * @returns a updated product
 */
export async function updateProductPurchasable(
  data: UpdateProductPurchasableInput & ProductIdInput
) {
  const { status, productId: id } = data;
  return prisma.products.update({
    where: { id: parseInt(id) },
    data: { purchasable: status == "y" },
  });
}
