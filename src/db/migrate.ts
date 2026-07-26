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

function describeError(error: unknown) {
  const messages: string[] = [];
  let current = error;

  for (let depth = 0; depth < 3 && current instanceof Error; depth += 1) {
    messages.push(current.message);
    current = current.cause;
  }

  return messages.join(" → ") || "Unknown database error";
}

void runMigrations().catch((error: unknown) => {
  console.error("Database migration failed:", describeError(error));
  process.exitCode = 1;
});
