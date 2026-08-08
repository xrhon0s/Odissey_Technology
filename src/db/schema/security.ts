import { sql } from "drizzle-orm";
import {
  check,
  index,
  integer,
  pgTable,
  primaryKey,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

export const requestRateLimits = pgTable(
  "request_rate_limits",
  {
    count: integer("count").default(1).notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    identityHash: varchar("identity_hash", { length: 64 }).notNull(),
    scope: varchar("scope", { length: 60 }).notNull(),
    windowStartedAt: timestamp("window_started_at", {
      withTimezone: true,
    }).notNull(),
  },
  (table) => [
    primaryKey({
      columns: [table.scope, table.identityHash, table.windowStartedAt],
      name: "request_rate_limits_pk",
    }),
    index("request_rate_limits_expiry_idx").on(table.expiresAt),
    check("request_rate_limits_count_positive", sql`${table.count} > 0`),
  ],
);
