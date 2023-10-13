import prisma from "../utils/prisma";
import { CreateStockItemsInput } from "./stock.schema";

/**
 * Create Stock Items
 * @returns created and upcreated data if productId not exist
 */
export async function createStockItems(data: CreateStockItemsInput) {
  return Promise.all(
    data.map(async ({ productId, ...rest }) => {
      const product = await prisma.products.findFirst({
        where: { id: productId },
      });
      if (product) {
        return prisma.stockItems.create({ data: { productId, ...rest } });
      }
      return {
        id: null,
        createdAt: null,
        updatedAt: null,
        deletedAt: null,
        productId,
        ...rest,
      };
    })
  );
}
