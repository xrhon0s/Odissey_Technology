import { describe, expect, it } from "vitest";

import { isPaymentMethodEligible } from "./payment-methods";

describe("isPaymentMethodEligible", () => {
  it("allows electronic manual methods nationwide", () => {
    expect(
      isPaymentMethodEligible({
        address: { city: "Bogotá", department: "Cundinamarca" },
        paymentMethod: "nequi",
        shippingMethodCode: "envio-nacional",
      }),
    ).toBe(true);
  });

  it("allows cash delivery in Valle de Aburrá ignoring accents", () => {
    expect(
      isPaymentMethodEligible({
        address: { city: "Itagui", department: "Antioquia" },
        paymentMethod: "cash_on_delivery",
        shippingMethodCode: "envio-nacional",
      }),
    ).toBe(true);
  });

  it("rejects cash delivery outside Valle de Aburrá", () => {
    expect(
      isPaymentMethodEligible({
        address: { city: "Rionegro", department: "Antioquia" },
        paymentMethod: "cash_on_delivery",
        shippingMethodCode: "envio-nacional",
      }),
    ).toBe(false);
  });

  it("allows cash for locally coordinated pickup", () => {
    expect(
      isPaymentMethodEligible({
        paymentMethod: "cash_on_delivery",
        shippingMethodCode: "recogida-local",
      }),
    ).toBe(true);
  });
});
