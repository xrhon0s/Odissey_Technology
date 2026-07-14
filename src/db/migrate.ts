import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";

import { getMigrationDatabaseUrl } from "@/config/env";

async function runMigrations() {
  const client = postgres(getMigrationDatabaseUrl(), { max: 1 });
  const database = drizzle(client);

  try {
    await migrate(database, { migrationsFolder: "src/db/migrations" });
    console.info("Database migrations completed successfully");
  } finally {
    await client.end();
  }
}

void runMigrations().catch(() => {
  console.error("Database migration failed");
  process.exitCode = 1;
});
