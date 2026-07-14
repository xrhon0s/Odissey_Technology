import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const productStatus = pgEnum("product_status", [
  "draft",
  "active",
  "archived",
]);

export const inventoryMovementType = pgEnum("inventory_movement_type", [
  "purchase",
  "sale",
  "return",
  "adjustment",
  "cancellation",
]);

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
};

export const categories = pgTable(
  "categories",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: varchar("name", { length: 120 }).notNull(),
    slug: varchar("slug", { length: 140 }).notNull(),
    description: text("description"),
    isActive: boolean("is_active").default(true).notNull(),
    sortOrder: integer("sort_order").default(0).notNull(),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("categories_slug_unique").on(table.slug),
    index("categories_active_sort_idx").on(table.isActive, table.sortOrder),
    check("categories_sort_order_non_negative", sql`${table.sortOrder} >= 0`),
  ],
);

export const products = pgTable(
  "products",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    categoryId: uuid("category_id")
      .notNull()
      .references(() => categories.id, { onDelete: "restrict" }),
    name: varchar("name", { length: 180 }).notNull(),
    slug: varchar("slug", { length: 200 }).notNull(),
    description: text("description").notNull(),
    compatibility: text("compatibility"),
    warranty: text("warranty"),
    status: productStatus("status").default("draft").notNull(),
    isFeatured: boolean("is_featured").default(false).notNull(),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("products_slug_unique").on(table.slug),
    index("products_category_status_idx").on(table.categoryId, table.status),
    index("products_featured_status_idx").on(table.isFeatured, table.status),
  ],
);

export const productImages = pgTable(
  "product_images",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    storagePath: varchar("storage_path", {
      length: 255,
    }).notNull(),
    url: text("url").notNull(),
    altText: varchar("alt_text", { length: 240 }).notNull(),
    sortOrder: integer("sort_order").default(0).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("product_images_storage_path_unique").on(table.storagePath),
    index("product_images_product_sort_idx").on(
      table.productId,
      table.sortOrder,
    ),
    check(
      "product_images_sort_order_non_negative",
      sql`${table.sortOrder} >= 0`,
    ),
  ],
);

export const productVariants = pgTable(
  "product_variants",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "restrict" }),
    sku: varchar("sku", { length: 80 }).notNull(),
    name: varchar("name", { length: 160 }).notNull(),
    optionValues: jsonb("option_values")
      .$type<Record<string, string>>()
      .default({})
      .notNull(),
    priceInCop: integer("price_in_cop").notNull(),
    compareAtPriceInCop: integer("compare_at_price_in_cop"),
    isActive: boolean("is_active").default(true).notNull(),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("product_variants_sku_unique").on(table.sku),
    index("product_variants_product_active_idx").on(
      table.productId,
      table.isActive,
    ),
    check("product_variants_price_non_negative", sql`${table.priceInCop} >= 0`),
    check(
      "product_variants_compare_price_non_negative",
      sql`${table.compareAtPriceInCop} is null or ${table.compareAtPriceInCop} >= 0`,
    ),
    check(
      "product_variants_compare_price_greater",
      sql`${table.compareAtPriceInCop} is null or ${table.compareAtPriceInCop} > ${table.priceInCop}`,
    ),
  ],
);
