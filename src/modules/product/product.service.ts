import prisma from "../utils/prisma";
import { GetProductFilter } from "./product.schema";

export async function getProductPagination(query: GetProductFilter) {
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

  const products = await prisma.product.findMany({
    where: whereConditions,
    take: limit,
    skip: (page - 1) * limit,
  });

  return Promise.all([
    products.map(async ({ id, ...rest }) => {
      const inStock = await prisma.stockItem.count({
        where: { productId: id, deletedAt: null },
      });
      return { id, ...rest, inStock };
    }),
  ]);
}
