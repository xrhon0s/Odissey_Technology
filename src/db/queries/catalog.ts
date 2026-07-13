import {
  and,
  asc,
  countDistinct,
  desc,
  eq,
  ilike,
  or,
  type SQL,
  sql,
} from "drizzle-orm";

import type { CatalogFilters } from "@/features/catalog/catalog-filters";

import { getDb } from "..";
import {
  categories,
  inventory,
  productImages,
  products,
  productVariants,
} from "../schema";

export type CatalogProductSummary = {
  availableQuantity: number;
  categoryName: string;
  id: string;
  isFeatured: boolean;
  minimumPriceInCop: number;
  name: string;
  primaryImageAlt: string | null;
  primaryImageUrl: string | null;
  slug: string;
};

export type CatalogPage = {
  items: CatalogProductSummary[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
};

function getCatalogConditions(filters: CatalogFilters): SQL[] {
  const conditions: SQL[] = [
    eq(products.status, "active"),
    eq(categories.isActive, true),
    eq(productVariants.isActive, true),
  ];

  if (filters.category) {
    conditions.push(eq(categories.slug, filters.category));
  }

  if (filters.search) {
    const term = `%${filters.search}%`;
    const searchCondition = or(
      ilike(products.name, term),
      ilike(products.description, term),
      ilike(productVariants.sku, term),
    );

    if (searchCondition) {
      conditions.push(searchCondition);
    }
  }

  return conditions;
}

function getCatalogOrder(filters: CatalogFilters): SQL[] {
  const minimumPrice = sql`min(${productVariants.priceInCop})`;

  switch (filters.sort) {
    case "newest":
      return [desc(products.createdAt), asc(products.name)];
    case "price-asc":
      return [asc(minimumPrice), asc(products.name)];
    case "price-desc":
      return [desc(minimumPrice), asc(products.name)];
    case "featured":
      return [desc(products.isFeatured), desc(products.createdAt)];
  }
}

export async function listCatalogProducts(
  filters: CatalogFilters,
): Promise<CatalogPage> {
  const db = getDb();
  const conditions = getCatalogConditions(filters);
  const where = and(...conditions);
  const offset = (filters.page - 1) * filters.pageSize;

  const [items, totalResult] = await Promise.all([
    db
      .select({
        availableQuantity: sql<number>`coalesce(sum(greatest(${inventory.quantity} - ${inventory.reservedQuantity}, 0)), 0)::integer`,
        categoryName: categories.name,
        id: products.id,
        isFeatured: products.isFeatured,
        minimumPriceInCop: sql<number>`min(${productVariants.priceInCop})::integer`,
        name: products.name,
        primaryImageAlt: sql<string | null>`(
          select image.alt_text
          from product_images image
          where image.product_id = ${products.id}
          order by image.sort_order asc, image.created_at asc
          limit 1
        )`,
        primaryImageUrl: sql<string | null>`(
          select image.url
          from product_images image
          where image.product_id = ${products.id}
          order by image.sort_order asc, image.created_at asc
          limit 1
        )`,
        slug: products.slug,
      })
      .from(products)
      .innerJoin(categories, eq(products.categoryId, categories.id))
      .innerJoin(productVariants, eq(productVariants.productId, products.id))
      .leftJoin(inventory, eq(inventory.variantId, productVariants.id))
      .where(where)
      .groupBy(products.id, categories.name)
      .orderBy(...getCatalogOrder(filters))
      .limit(filters.pageSize)
      .offset(offset),
    db
      .select({ total: countDistinct(products.id) })
      .from(products)
      .innerJoin(categories, eq(products.categoryId, categories.id))
      .innerJoin(productVariants, eq(productVariants.productId, products.id))
      .where(where),
  ]);

  const totalItems = totalResult[0]?.total ?? 0;

  return {
    items,
    page: filters.page,
    pageSize: filters.pageSize,
    totalItems,
    totalPages: Math.ceil(totalItems / filters.pageSize),
  };
}

export async function getCatalogProductBySlug(slug: string) {
  const db = getDb();
  const [product] = await db
    .select({
      categoryName: categories.name,
      categorySlug: categories.slug,
      compatibility: products.compatibility,
      description: products.description,
      id: products.id,
      name: products.name,
      slug: products.slug,
      warranty: products.warranty,
    })
    .from(products)
    .innerJoin(categories, eq(products.categoryId, categories.id))
    .where(
      and(
        eq(products.slug, slug),
        eq(products.status, "active"),
        eq(categories.isActive, true),
      ),
    )
    .limit(1);

  if (!product) {
    return null;
  }

  const [images, variants] = await Promise.all([
    db
      .select({
        altText: productImages.altText,
        id: productImages.id,
        url: productImages.url,
      })
      .from(productImages)
      .where(eq(productImages.productId, product.id))
      .orderBy(asc(productImages.sortOrder), asc(productImages.createdAt)),
    db
      .select({
        availableQuantity: sql<number>`greatest(coalesce(${inventory.quantity}, 0) - coalesce(${inventory.reservedQuantity}, 0), 0)::integer`,
        compareAtPriceInCop: productVariants.compareAtPriceInCop,
        id: productVariants.id,
        name: productVariants.name,
        optionValues: productVariants.optionValues,
        priceInCop: productVariants.priceInCop,
        sku: productVariants.sku,
      })
      .from(productVariants)
      .leftJoin(inventory, eq(inventory.variantId, productVariants.id))
      .where(
        and(
          eq(productVariants.productId, product.id),
          eq(productVariants.isActive, true),
        ),
      )
      .orderBy(asc(productVariants.priceInCop), asc(productVariants.name)),
  ]);

  return { ...product, images, variants };
}
