import { describe, expect, it } from "vitest";

import { serverEnvSchema } from "./env";

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
