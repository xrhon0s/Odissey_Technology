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
  supportEmail: varchar("support_email", { length: 254 }),
  whatsappNumber: varchar("whatsapp_number", { length: 15 }),
  whatsappEnabled: boolean("whatsapp_enabled").default(false).notNull(),
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
