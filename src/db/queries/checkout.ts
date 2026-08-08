import { and, asc, eq, inArray, sql } from "drizzle-orm";

import type {
  CheckoutQuoteRepository,
  CheckoutShippingMethod,
  CheckoutVariant,
} from "@/features/checkout/checkout-service";

import { getDb } from "..";
import {
  inventory,
  products,
  productVariants,
  shippingMethods,
} from "../schema";

export async function listActiveShippingMethods(): Promise<
  CheckoutShippingMethod[]
> {
  return getDb()
    .select({
      code: shippingMethods.code,
      description: shippingMethods.description,
      name: shippingMethods.name,
      priceInCop: shippingMethods.priceInCop,
      requiresAddress: shippingMethods.requiresAddress,
    })
    .from(shippingMethods)
    .where(eq(shippingMethods.isActive, true))
    .orderBy(asc(shippingMethods.sortOrder), asc(shippingMethods.name));
}

export const checkoutQuoteRepository: CheckoutQuoteRepository = {
  async findActiveShippingMethod(code) {
    const [method] = await getDb()
      .select({
        code: shippingMethods.code,
        description: shippingMethods.description,
        name: shippingMethods.name,
        priceInCop: shippingMethods.priceInCop,
        requiresAddress: shippingMethods.requiresAddress,
      })
      .from(shippingMethods)
      .where(
        and(eq(shippingMethods.code, code), eq(shippingMethods.isActive, true)),
      )
      .limit(1);

    return method ?? null;
  },

  async findActiveVariants(variantIds): Promise<CheckoutVariant[]> {
    if (variantIds.length === 0) return [];

    return getDb()
      .select({
        availableQuantity: sql<number>`greatest(coalesce(${inventory.quantity}, 0) - coalesce(${inventory.reservedQuantity}, 0), 0)::integer`,
        priceInCop: productVariants.priceInCop,
        productName: products.name,
        sku: productVariants.sku,
        variantId: productVariants.id,
        variantName: productVariants.name,
      })
      .from(productVariants)
      .innerJoin(products, eq(productVariants.productId, products.id))
      .leftJoin(inventory, eq(inventory.variantId, productVariants.id))
      .where(
        and(
          inArray(productVariants.id, variantIds),
          eq(productVariants.isActive, true),
          eq(products.status, "active"),
        ),
      );
  },
};
