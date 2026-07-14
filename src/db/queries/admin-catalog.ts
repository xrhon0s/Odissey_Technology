import { asc, count, eq, min, sql } from "drizzle-orm";

import { getDb } from "..";
import {
  categories,
  inventory,
  productImages,
  products,
  productVariants,
} from "../schema";

export async function listAdminCategories() {
  return getDb()
    .select({
      id: categories.id,
      description: categories.description,
      isActive: categories.isActive,
      name: categories.name,
      slug: categories.slug,
      sortOrder: categories.sortOrder,
    })
    .from(categories)
    .orderBy(asc(categories.sortOrder), asc(categories.name));
}

export async function listAdminProducts() {
  return getDb()
    .select({
      categoryName: categories.name,
      id: products.id,
      isFeatured: products.isFeatured,
      minimumPriceInCop: min(productVariants.priceInCop),
      name: products.name,
      slug: products.slug,
      status: products.status,
      variantCount: count(productVariants.id),
    })
    .from(products)
    .innerJoin(categories, eq(products.categoryId, categories.id))
    .leftJoin(productVariants, eq(productVariants.productId, products.id))
    .groupBy(products.id, categories.name)
    .orderBy(asc(products.name));
}

export async function getAdminProduct(productId: string) {
  const db = getDb();
  const [product] = await db
    .select({
      categoryId: products.categoryId,
      categoryName: categories.name,
      compatibility: products.compatibility,
      description: products.description,
      id: products.id,
      isFeatured: products.isFeatured,
      name: products.name,
      slug: products.slug,
      status: products.status,
      warranty: products.warranty,
    })
    .from(products)
    .innerJoin(categories, eq(products.categoryId, categories.id))
    .where(eq(products.id, productId))
    .limit(1);

  if (!product) return null;

  const [variants, images] = await Promise.all([
    db
      .select({
        availableQuantity: sql<number>`greatest(coalesce(${inventory.quantity}, 0) - coalesce(${inventory.reservedQuantity}, 0), 0)::integer`,
        compareAtPriceInCop: productVariants.compareAtPriceInCop,
        id: productVariants.id,
        isActive: productVariants.isActive,
        lowStockThreshold: sql<number>`coalesce(${inventory.lowStockThreshold}, 0)::integer`,
        name: productVariants.name,
        priceInCop: productVariants.priceInCop,
        quantity: sql<number>`coalesce(${inventory.quantity}, 0)::integer`,
        reservedQuantity: sql<number>`coalesce(${inventory.reservedQuantity}, 0)::integer`,
        sku: productVariants.sku,
      })
      .from(productVariants)
      .leftJoin(inventory, eq(inventory.variantId, productVariants.id))
      .where(eq(productVariants.productId, product.id))
      .orderBy(asc(productVariants.name)),
    db
      .select({
        altText: productImages.altText,
        id: productImages.id,
        sortOrder: productImages.sortOrder,
        url: productImages.url,
      })
      .from(productImages)
      .where(eq(productImages.productId, product.id))
      .orderBy(asc(productImages.sortOrder), asc(productImages.createdAt)),
  ]);

  return { ...product, images, variants };
}
