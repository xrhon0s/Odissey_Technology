import { describe, expect, it } from "vitest";

import { storeSettingsInputSchema } from "./manage-store-settings";

const validInput = {
  announcement: "Envíos a toda Colombia",
  bancolombiaAccountNumber: "23652931391",
  bancolombiaEnabled: true,
  bancolombiaKey: "@davids700",
  businessCity: "Medellín, Colombia",
  cashOnDeliveryEnabled: true,
  daviplataEnabled: false,
  legalName: "Odissey Technology S.A.S.",
  nequiEnabled: true,
  nequiKey: "@NEQUIDAV5700",
  nequiNumber: "3126485885",
  notificationAddress: "Calle 1 # 2-3",
  storeName: "Odissey Technology",
  supportEmail: "ventas@example.com",
  taxId: "900123456-7",
  whatsappEnabled: true,
  whatsappNumber: "+57 300 123 4567",
};

describe("storeSettingsInputSchema", () => {
  it("normalizes the WhatsApp number", () => {
    expect(storeSettingsInputSchema.parse(validInput).whatsappNumber).toBe(
      "573001234567",
    );
  });

  it("requires a number when WhatsApp is enabled", () => {
    const result = storeSettingsInputSchema.safeParse({
      ...validInput,
      whatsappNumber: "",
    });

    expect(result.success).toBe(false);
  });

  it("allows optional contact channels to stay disabled", () => {
    expect(
      storeSettingsInputSchema.parse({
        ...validInput,
        supportEmail: "",
        whatsappEnabled: false,
        whatsappNumber: "",
      }),
    ).toMatchObject({ supportEmail: null, whatsappNumber: null });
  });

  it("requires payment details before enabling a transfer method", () => {
    const result = storeSettingsInputSchema.safeParse({
      ...validInput,
      nequiKey: "",
      nequiNumber: "",
    });

    expect(result.success).toBe(false);
  });
});
