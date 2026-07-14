import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { getServerEnv } from "@/config/env";

import * as schema from "./schema";

const globalForDatabase = globalThis as unknown as {
  databaseClient?: ReturnType<typeof postgres>;
};

export function getDb() {
  const client =
    globalForDatabase.databaseClient ??
    postgres(getServerEnv().DATABASE_URL, {
      connect_timeout: 10,
      idle_timeout: 20,
      max: process.env.NODE_ENV === "production" ? 10 : 5,
      max_lifetime: 60 * 30,
      prepare: false,
    });

  if (process.env.NODE_ENV !== "production") {
    globalForDatabase.databaseClient = client;
  }

  return drizzle(client, { schema });
}
