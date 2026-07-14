import { asc, eq, sql } from "drizzle-orm";

import { getDb } from "..";
import { inventory, products, productVariants } from "../schema";

export async function listAdminInventory() {
  return getDb()
    .select({
      availableQuantity: sql<number>`greatest(${inventory.quantity} - ${inventory.reservedQuantity}, 0)::integer`,
      inventoryId: inventory.id,
      isVariantActive: productVariants.isActive,
      lowStockThreshold: inventory.lowStockThreshold,
      productName: products.name,
      quantity: inventory.quantity,
      reservedQuantity: inventory.reservedQuantity,
      sku: productVariants.sku,
      updatedAt: inventory.updatedAt,
      variantId: productVariants.id,
      variantName: productVariants.name,
    })
    .from(inventory)
    .innerJoin(productVariants, eq(inventory.variantId, productVariants.id))
    .innerJoin(products, eq(productVariants.productId, products.id))
    .orderBy(asc(products.name), asc(productVariants.name));
}
