import { describe, expect, it } from "vitest";

import { buildWhatsAppUrl } from "./store-settings";

describe("buildWhatsAppUrl", () => {
  it("does not expose a link when WhatsApp is disabled", () => {
    expect(
      buildWhatsAppUrl({
        storeName: "Odissey Technology",
        whatsappEnabled: false,
        whatsappNumber: "573001234567",
      }),
    ).toBeNull();
  });

  it("builds an encoded WhatsApp contact link", () => {
    expect(
      buildWhatsAppUrl({
        storeName: "Odissey Technology",
        whatsappEnabled: true,
        whatsappNumber: "573001234567",
      }),
    ).toBe(
      "https://wa.me/573001234567?text=Hola%2C%20quiero%20recibir%20informaci%C3%B3n%20sobre%20los%20productos%20de%20Odissey%20Technology.",
    );
  });
});
