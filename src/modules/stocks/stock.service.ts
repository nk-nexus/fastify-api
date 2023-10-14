/**
 * *****************************************
 * NOTE: this file required node >= 14.17.0
 * *****************************************
 */
import crypto from "crypto";
import prisma from "../../utils/prisma";
import { CreateStockItemsInput } from "./stock.schema";

/**
 * Create Stock Items
 * @returns created and upcreated data if productId not exist
 */
export async function createStockItems(data: CreateStockItemsInput) {
  return Promise.all(
    data.map(async ({ productId, details }) => {
      const product = await prisma.products.findFirst({
        where: { id: productId },
      });
      if (product) {
        const code = crypto.randomUUID();
        return prisma.stockItems.create({ data: { productId, details, code } });
      }
      return {
        id: null,
        code: "",
        createdAt: null,
        updatedAt: null,
        deletedAt: null,
        productId,
        details,
      };
    })
  );
}
