import { sql } from "drizzle-orm";
import {
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

import { orders } from "./orders";
import { adminUsers } from "./admin";

export const paymentStatus = pgEnum("payment_status", [
  "pending",
  "approved",
  "declined",
  "voided",
  "refunded",
]);

export const paymentMethod = pgEnum("payment_method", [
  "manual_transfer",
  "nequi",
  "daviplata",
  "bancolombia_transfer",
  "cash_on_delivery",
]);

export const payments = pgTable(
  "payments",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "restrict" }),
    reference: varchar("reference", { length: 48 }).notNull(),
    method: paymentMethod("method").notNull(),
    status: paymentStatus("status").default("pending").notNull(),
    amountInCop: integer("amount_in_cop").notNull(),
    proofUrl: text("proof_url"),
    reviewNotes: text("review_notes"),
    approvedAt: timestamp("approved_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("payments_order_unique").on(table.orderId),
    uniqueIndex("payments_reference_unique").on(table.reference),
    index("payments_status_created_idx").on(table.status, table.createdAt),
    check("payments_amount_positive", sql`${table.amountInCop} > 0`),
    check(
      "payments_approved_at_consistent",
      sql`(${table.status} = 'approved' and ${table.approvedAt} is not null) or (${table.status} <> 'approved' and ${table.approvedAt} is null)`,
    ),
  ],
);

export const paymentEvents = pgTable(
  "payment_events",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    paymentId: uuid("payment_id")
      .notNull()
      .references(() => payments.id, { onDelete: "restrict" }),
    eventType: varchar("event_type", { length: 60 }).notNull(),
    externalEventId: varchar("external_event_id", { length: 160 }),
    actorAdminId: uuid("actor_admin_id").references(() => adminUsers.id, {
      onDelete: "restrict",
    }),
    payload: jsonb("payload")
      .$type<Record<string, unknown>>()
      .default({})
      .notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("payment_events_payment_created_idx").on(
      table.paymentId,
      table.createdAt,
    ),
    uniqueIndex("payment_events_external_event_unique").on(
      table.externalEventId,
    ),
  ],
);
