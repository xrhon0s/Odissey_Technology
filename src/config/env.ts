import { z } from "zod";

export const serverEnvSchema = z.object({
  DATABASE_URL: z.url().startsWith("postgresql://"),
});

export const migrationDatabaseUrlSchema = z.url().startsWith("postgresql://");

export type ServerEnv = z.infer<typeof serverEnvSchema>;

let cachedEnv: ServerEnv | undefined;

export function getServerEnv(): ServerEnv {
  cachedEnv ??= serverEnvSchema.parse(process.env);
  return cachedEnv;
}

export function getMigrationDatabaseUrl() {
  return migrationDatabaseUrlSchema.parse(
    process.env.MIGRATION_DATABASE_URL ?? process.env.DATABASE_URL,
  );
}
