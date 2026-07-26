import { timestamp, uniqueIndex, uuid, varchar } from "drizzle-orm/pg-core";

import { pgTable } from "drizzle-orm/pg-core";

export const customerProfiles = pgTable(
  "customer_profiles",
  {
    id: uuid("id").primaryKey(),
    email: varchar("email", { length: 254 }).notNull(),
    fullName: varchar("full_name", { length: 120 }).notNull(),
    phone: varchar("phone", { length: 20 }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [uniqueIndex("customer_profiles_email_unique").on(table.email)],
);
