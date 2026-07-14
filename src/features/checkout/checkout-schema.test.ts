import { describe, expect, it } from "vitest";

import { checkoutQuoteRequestSchema } from "./checkout-schema";

const validRequest = {
  customer: {
    email: "cliente@example.com",
    fullName: "Ada Lovelace",
    phone: "3001234567",
  },
  items: [
    {
      quantity: 2,
      variantId: "30000000-0000-4000-8000-000000000001",
    },
  ],
  paymentMethod: "nequi",
  shippingMethodCode: "envio-nacional",
};

describe("checkoutQuoteRequestSchema", () => {
  it("accepts a valid guest quote request", () => {
    expect(checkoutQuoteRequestSchema.safeParse(validRequest).success).toBe(
      true,
    );
  });

  it("rejects duplicate variants", () => {
    const result = checkoutQuoteRequestSchema.safeParse({
      ...validRequest,
      items: [validRequest.items[0], validRequest.items[0]],
    });

    expect(result.success).toBe(false);
  });

  it("rejects invalid quantities and contact data", () => {
    const result = checkoutQuoteRequestSchema.safeParse({
      ...validRequest,
      customer: { ...validRequest.customer, email: "not-an-email" },
      items: [{ ...validRequest.items[0], quantity: 0 }],
    });

    expect(result.success).toBe(false);
  });
});
