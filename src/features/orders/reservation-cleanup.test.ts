import { describe, expect, it } from "vitest";

import { isReservationCleanupAuthorized } from "./reservation-cleanup";

describe("isReservationCleanupAuthorized", () => {
  const secret = "a-secure-reservation-secret";

  it("accepts the configured bearer token", () => {
    expect(isReservationCleanupAuthorized(`Bearer ${secret}`, secret)).toBe(
      true,
    );
  });

  it("rejects missing, short or incorrect secrets", () => {
    expect(isReservationCleanupAuthorized(null, secret)).toBe(false);
    expect(isReservationCleanupAuthorized("Bearer incorrect", secret)).toBe(
      false,
    );
    expect(isReservationCleanupAuthorized("Bearer short", "short")).toBe(false);
  });
});
