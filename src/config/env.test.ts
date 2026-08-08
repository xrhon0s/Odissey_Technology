import { describe, expect, it } from "vitest";

import { migrationDatabaseUrlSchema, serverEnvSchema } from "./env";

describe("serverEnvSchema", () => {
  it("accepts a PostgreSQL connection URL", () => {
    const result = serverEnvSchema.safeParse({
      DATABASE_URL: "postgresql://user:password@localhost:5432/odissey",
    });

    expect(result.success).toBe(true);
  });

  it("rejects non-PostgreSQL URLs", () => {
    const result = serverEnvSchema.safeParse({
      DATABASE_URL: "https://example.com/database",
    });

    expect(result.success).toBe(false);
  });
});

describe("migrationDatabaseUrlSchema", () => {
  it("accepts a direct PostgreSQL connection", () => {
    expect(
      migrationDatabaseUrlSchema.safeParse(
        "postgresql://postgres:secret@db.example.supabase.co:5432/postgres",
      ).success,
    ).toBe(true);
  });
});
