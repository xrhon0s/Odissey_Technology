import { sql } from "drizzle-orm";
import {
  check,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

import { productVariants } from "./catalog";
import { adminUsers } from "./admin";

export const orderStatus = pgEnum("order_status", [
  "pending",
  "confirmed",
  "preparing",
  "shipped",
  "delivered",
  "cancelled",
]);

export type OrderAddressSnapshot = {
  addressLine1: string;
  addressLine2?: string;
  city: string;
  deliveryNotes?: string;
  department: string;
  neighborhood?: string;
};

export const orders = pgTable(
  "orders",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    reference: varchar("reference", { length: 40 }).notNull(),
    checkoutAttemptId: uuid("checkout_attempt_id").notNull(),
    requestFingerprint: varchar("request_fingerprint", {
      length: 64,
    }).notNull(),
    status: orderStatus("status").default("pending").notNull(),
    customerName: varchar("customer_name", { length: 120 }).notNull(),
    customerEmail: varchar("customer_email", { length: 254 }).notNull(),
    customerPhone: varchar("customer_phone", { length: 20 }).notNull(),
    addressSnapshot: jsonb("address_snapshot").$type<OrderAddressSnapshot>(),
    shippingMethodCode: varchar("shipping_method_code", {
      length: 60,
    }).notNull(),
    shippingMethodName: varchar("shipping_method_name", {
      length: 120,
    }).notNull(),
    subtotalInCop: integer("subtotal_in_cop").notNull(),
    shippingInCop: integer("shipping_in_cop").notNull(),
    totalInCop: integer("total_in_cop").notNull(),
    reservationExpiresAt: timestamp("reservation_expires_at", {
      withTimezone: true,
    }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("orders_reference_unique").on(table.reference),
    uniqueIndex("orders_checkout_attempt_unique").on(table.checkoutAttemptId),
    index("orders_status_created_idx").on(table.status, table.createdAt),
    index("orders_customer_email_created_idx").on(
      table.customerEmail,
      table.createdAt,
    ),
    check("orders_subtotal_non_negative", sql`${table.subtotalInCop} >= 0`),
    check("orders_shipping_non_negative", sql`${table.shippingInCop} >= 0`),
    check("orders_total_non_negative", sql`${table.totalInCop} >= 0`),
    check(
      "orders_total_matches_components",
      sql`${table.totalInCop} = ${table.subtotalInCop} + ${table.shippingInCop}`,
    ),
  ],
);

export const orderItems = pgTable(
  "order_items",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "restrict" }),
    variantId: uuid("variant_id")
      .notNull()
      .references(() => productVariants.id, { onDelete: "restrict" }),
    productName: varchar("product_name", { length: 180 }).notNull(),
    variantName: varchar("variant_name", { length: 160 }).notNull(),
    sku: varchar("sku", { length: 80 }).notNull(),
    quantity: integer("quantity").notNull(),
    unitPriceInCop: integer("unit_price_in_cop").notNull(),
    lineTotalInCop: integer("line_total_in_cop").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("order_items_order_variant_unique").on(
      table.orderId,
      table.variantId,
    ),
    index("order_items_variant_idx").on(table.variantId),
    check("order_items_quantity_positive", sql`${table.quantity} > 0`),
    check(
      "order_items_unit_price_non_negative",
      sql`${table.unitPriceInCop} >= 0`,
    ),
    check(
      "order_items_line_total_matches",
      sql`${table.lineTotalInCop} = ${table.unitPriceInCop} * ${table.quantity}`,
    ),
  ],
);

export const orderEvents = pgTable(
  "order_events",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "restrict" }),
    eventType: varchar("event_type", { length: 60 }).notNull(),
    fromStatus: orderStatus("from_status"),
    toStatus: orderStatus("to_status").notNull(),
    notes: varchar("notes", { length: 500 }),
    actorAdminId: uuid("actor_admin_id").references(() => adminUsers.id, {
      onDelete: "restrict",
    }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("order_events_order_created_idx").on(table.orderId, table.createdAt),
  ],
);
