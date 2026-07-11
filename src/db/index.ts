import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { getServerEnv } from "@/config/env";

import * as schema from "./schema";

const globalForDatabase = globalThis as unknown as {
  databaseClient?: ReturnType<typeof postgres>;
};

const client =
  globalForDatabase.databaseClient ??
  postgres(getServerEnv().DATABASE_URL, {
    max: process.env.NODE_ENV === "production" ? 10 : 1,
    prepare: false,
  });

if (process.env.NODE_ENV !== "production") {
  globalForDatabase.databaseClient = client;
}

export const db = drizzle(client, { schema });
