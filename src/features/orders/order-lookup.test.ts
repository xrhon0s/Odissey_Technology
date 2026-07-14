import { describe, expect, it } from "vitest";

import { getEffectiveOrderState, orderLookupInputSchema } from "./order-lookup";

describe("orderLookupInputSchema", () => {
  it("normalizes the public reference", () => {
    expect(
      orderLookupInputSchema.parse({
        email: "cliente@example.com",
        reference: " od-m123-abc45678 ",
      }).reference,
    ).toBe("OD-M123-ABC45678");
  });

  it("rejects incomplete lookup credentials", () => {
    expect(
      orderLookupInputSchema.safeParse({ email: "no-es-correo", reference: "" })
        .success,
    ).toBe(false);
  });
});

describe("getEffectiveOrderState", () => {
  it("shows an expired pending reservation as cancelled", () => {
    expect(
      getEffectiveOrderState({
        now: new Date("2026-07-14T18:00:00Z"),
        paymentStatus: "pending",
        reservationExpiresAt: new Date("2026-07-14T17:59:59Z"),
        status: "pending",
      }),
    ).toEqual({ paymentStatus: "voided", status: "cancelled" });
  });

  it("preserves orders already being processed", () => {
    expect(
      getEffectiveOrderState({
        now: new Date("2026-07-14T18:00:00Z"),
        paymentStatus: "approved",
        reservationExpiresAt: new Date("2026-07-14T17:00:00Z"),
        status: "preparing",
      }),
    ).toEqual({ paymentStatus: "approved", status: "preparing" });
  });
});
