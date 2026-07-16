import {
  boolean,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

import { adminUsers } from "./admin";

export const storeSettings = pgTable("store_settings", {
  id: varchar("id", { length: 40 }).primaryKey(),
  storeName: varchar("store_name", { length: 120 })
    .default("Odissey Technology")
    .notNull(),
  announcement: varchar("announcement", { length: 180 })
    .default("Envíos a toda Colombia")
    .notNull(),
  legalName: varchar("legal_name", { length: 160 }),
  taxId: varchar("tax_id", { length: 30 }),
  notificationAddress: varchar("notification_address", { length: 240 }),
  businessCity: varchar("business_city", { length: 120 }),
  supportEmail: varchar("support_email", { length: 254 }),
  whatsappNumber: varchar("whatsapp_number", { length: 15 }),
  whatsappEnabled: boolean("whatsapp_enabled").default(false).notNull(),
  nequiEnabled: boolean("nequi_enabled").default(true).notNull(),
  nequiNumber: varchar("nequi_number", { length: 20 }).default("3126485885"),
  nequiKey: varchar("nequi_key", { length: 80 }).default("@NEQUIDAV5700"),
  bancolombiaEnabled: boolean("bancolombia_enabled").default(true).notNull(),
  bancolombiaAccountNumber: varchar("bancolombia_account_number", {
    length: 30,
  }).default("23652931391"),
  bancolombiaKey: varchar("bancolombia_key", { length: 80 }).default(
    "@davids700",
  ),
  daviplataEnabled: boolean("daviplata_enabled").default(false).notNull(),
  cashOnDeliveryEnabled: boolean("cash_on_delivery_enabled")
    .default(true)
    .notNull(),
  updatedByAdminId: uuid("updated_by_admin_id").references(
    () => adminUsers.id,
    { onDelete: "set null" },
  ),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});
