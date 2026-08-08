import { describe, expect, it } from "vitest";

import {
  buildPaymentInstructions,
  getAvailableManualPaymentMethods,
  isPaymentMethodEligible,
} from "./payment-methods";

const paymentSettings = {
  bancolombiaAccountNumber: "23652931391",
  bancolombiaEnabled: true,
  bancolombiaKey: "@davids700",
  cashOnDeliveryEnabled: true,
  daviplataEnabled: false,
  nequiEnabled: true,
  nequiKey: "@NEQUIDAV5700",
  nequiNumber: "3126485885",
};

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

describe("manual payment configuration", () => {
  it("only exposes enabled methods", () => {
    expect(
      getAvailableManualPaymentMethods(paymentSettings).map(
        (method) => method.code,
      ),
    ).toEqual(["nequi", "bancolombia_transfer", "cash_on_delivery"]);
  });

  it("builds Nequi instructions with QR and direct transfer data", () => {
    expect(buildPaymentInstructions("nequi", paymentSettings)).toMatchObject({
      details: [
        { label: "Número Nequi", value: "3126485885" },
        { label: "Llave Bre-B", value: "@NEQUIDAV5700" },
      ],
      qrImage: { src: "/images/payments/nequi-qr.png" },
      title: "Paga por Nequi",
    });
  });

  it("does not publish incomplete DaviPlata instructions", () => {
    expect(buildPaymentInstructions("daviplata", paymentSettings)).toBeNull();
  });
});
