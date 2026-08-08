import { describe, expect, it } from "vitest";

import { shipmentInputSchema } from "./shipment";

describe("shipmentInputSchema", () => {
  it("normalizes optional shipment data", () => {
    const shipment = shipmentInputSchema.parse({
      carrier: " Servientrega ",
      estimatedDeliveryAt: "2026-07-20",
      trackingNumber: " 123456789 ",
      trackingUrl: " https://www.servientrega.com/rastreo ",
    });

    expect(shipment.carrier).toBe("Servientrega");
    expect(shipment.trackingNumber).toBe("123456789");
    expect(shipment.trackingUrl).toBe("https://www.servientrega.com/rastreo");
    expect(shipment.estimatedDeliveryAt).toBeInstanceOf(Date);
  });

  it("rejects non-http tracking links", () => {
    expect(
      shipmentInputSchema.safeParse({
        carrier: "Transportadora",
        estimatedDeliveryAt: "",
        trackingNumber: "ABC123",
        trackingUrl: "javascript:alert(1)",
      }).success,
    ).toBe(false);
  });
});
