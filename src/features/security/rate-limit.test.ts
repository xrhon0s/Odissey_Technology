import { describe, expect, it } from "vitest";

import { buildRateLimitWindow, getRequestIdentity } from "./rate-limit";

describe("buildRateLimitWindow", () => {
  it("creates deterministic private identities inside a fixed window", () => {
    const input = {
      identity: "Cliente@Example.com",
      now: new Date("2026-07-26T12:07:00.000Z"),
      policy: { limit: 5, scope: "orders", windowMs: 15 * 60 * 1000 },
      secret: "a-secure-secret-with-more-than-32-characters",
    };
    const first = buildRateLimitWindow(input);
    const second = buildRateLimitWindow({
      ...input,
      identity: "cliente@example.com",
    });

    expect(first.identityHash).toHaveLength(64);
    expect(first.identityHash).not.toContain("cliente");
    expect(first.identityHash).toBe(second.identityHash);
    expect(first.windowStartedAt.toISOString()).toBe(
      "2026-07-26T12:00:00.000Z",
    );
    expect(first.expiresAt.toISOString()).toBe("2026-07-26T12:15:00.000Z");
  });
});

describe("getRequestIdentity", () => {
  it("uses the first forwarded address", () => {
    expect(
      getRequestIdentity(
        new Request("https://example.com", {
          headers: { "x-forwarded-for": "203.0.113.4, 10.0.0.1" },
        }),
      ),
    ).toBe("203.0.113.4");
  });
});
