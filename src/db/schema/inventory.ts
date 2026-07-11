import { sql } from "drizzle-orm";
import {
  check,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

import { inventoryMovementType, productVariants } from "./catalog";

export const inventory = pgTable(
  "inventory",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    variantId: uuid("variant_id")
      .notNull()
      .references(() => productVariants.id, { onDelete: "restrict" }),
    quantity: integer("quantity").default(0).notNull(),
    reservedQuantity: integer("reserved_quantity").default(0).notNull(),
    lowStockThreshold: integer("low_stock_threshold").default(5).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("inventory_variant_unique").on(table.variantId),
    check("inventory_quantity_non_negative", sql`${table.quantity} >= 0`),
    check(
      "inventory_reserved_non_negative",
      sql`${table.reservedQuantity} >= 0`,
    ),
    check(
      "inventory_reserved_not_above_quantity",
      sql`${table.reservedQuantity} <= ${table.quantity}`,
    ),
    check(
      "inventory_low_stock_threshold_non_negative",
      sql`${table.lowStockThreshold} >= 0`,
    ),
  ],
);

export const inventoryMovements = pgTable(
  "inventory_movements",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    variantId: uuid("variant_id")
      .notNull()
      .references(() => productVariants.id, { onDelete: "restrict" }),
    type: inventoryMovementType("type").notNull(),
    quantityDelta: integer("quantity_delta").notNull(),
    resultingQuantity: integer("resulting_quantity").notNull(),
    reason: text("reason").notNull(),
    referenceType: varchar("reference_type", { length: 60 }),
    referenceId: uuid("reference_id"),
    actorAdminId: uuid("actor_admin_id"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("inventory_movements_variant_created_idx").on(
      table.variantId,
      table.createdAt,
    ),
    index("inventory_movements_reference_idx").on(
      table.referenceType,
      table.referenceId,
    ),
    check(
      "inventory_movements_delta_non_zero",
      sql`${table.quantityDelta} <> 0`,
    ),
    check(
      "inventory_movements_result_non_negative",
      sql`${table.resultingQuantity} >= 0`,
    ),
  ],
);
