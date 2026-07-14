import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { z } from "zod";

import { getServerEnv } from "@/config/env";

import { adminUsers } from "./schema";

const bootstrapAdminSchema = z.object({
  ADMIN_AUTH_USER_ID: z.uuid(),
  ADMIN_EMAIL: z.email().max(254),
  ADMIN_FULL_NAME: z.string().trim().min(2).max(120),
  BOOTSTRAP_ADMIN: z.literal("true"),
});

async function bootstrapAdmin() {
  const input = bootstrapAdminSchema.parse(process.env);
  const client = postgres(getServerEnv().DATABASE_URL, { max: 1 });
  const database = drizzle(client);

  try {
    await database
      .insert(adminUsers)
      .values({
        email: input.ADMIN_EMAIL,
        fullName: input.ADMIN_FULL_NAME,
        id: input.ADMIN_AUTH_USER_ID,
        role: "owner",
      })
      .onConflictDoUpdate({
        target: adminUsers.id,
        set: {
          email: input.ADMIN_EMAIL,
          fullName: input.ADMIN_FULL_NAME,
          isActive: true,
          role: "owner",
          updatedAt: new Date(),
        },
      });

    console.info("Administrator bootstrap completed successfully");
  } finally {
    await client.end();
  }
}

void bootstrapAdmin().catch(() => {
  console.error("Administrator bootstrap failed");
  process.exitCode = 1;
});
