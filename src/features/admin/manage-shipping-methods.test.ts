import { describe, expect, it } from "vitest";

import { shippingMethodInputSchema } from "./manage-shipping-methods";

const validInput = {
  code: "envio-metropolitano",
  description: "Entrega coordinada en el Valle de Aburrá.",
  isActive: true,
  name: "Envío metropolitano",
  priceInCop: "8000",
  requiresAddress: true,
  sortOrder: "1",
};

describe("shippingMethodInputSchema", () => {
  it("normalizes numeric form values", () => {
    expect(shippingMethodInputSchema.parse(validInput)).toMatchObject({
      priceInCop: 8000,
      sortOrder: 1,
    });
  });

  it("allows free local pickup", () => {
    expect(
      shippingMethodInputSchema.parse({
        ...validInput,
        code: "recogida-local",
        priceInCop: "0",
        requiresAddress: false,
      }),
    ).toMatchObject({ priceInCop: 0, requiresAddress: false });
  });

  it("rejects codes that are unsafe for checkout", () => {
    expect(
      shippingMethodInputSchema.safeParse({
        ...validInput,
        code: "Envío Medellín",
      }).success,
    ).toBe(false);
  });
});
