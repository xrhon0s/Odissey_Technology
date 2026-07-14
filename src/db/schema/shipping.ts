import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const shippingMethods = pgTable(
  "shipping_methods",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    code: varchar("code", { length: 60 }).notNull(),
    name: varchar("name", { length: 120 }).notNull(),
    description: text("description").notNull(),
    priceInCop: integer("price_in_cop").notNull(),
    requiresAddress: boolean("requires_address").default(true).notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    sortOrder: integer("sort_order").default(0).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("shipping_methods_code_unique").on(table.code),
    check("shipping_methods_price_non_negative", sql`${table.priceInCop} >= 0`),
    check(
      "shipping_methods_sort_order_non_negative",
      sql`${table.sortOrder} >= 0`,
    ),
  ],
);
