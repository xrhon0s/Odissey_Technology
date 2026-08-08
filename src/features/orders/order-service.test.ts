import { describe, expect, it } from "vitest";

import type { CreateOrderRequest } from "./order-schema";
import { createOrderRequestFingerprint } from "./order-service";

const request: CreateOrderRequest = {
  checkout: {
    acceptedTerms: true,
    customer: {
      email: "cliente@example.com",
      fullName: "Ada Lovelace",
      phone: "3001234567",
    },
    items: [
      {
        quantity: 1,
        variantId: "30000000-0000-4000-8000-000000000001",
      },
      {
        quantity: 2,
        variantId: "30000000-0000-4000-8000-000000000002",
      },
    ],
    paymentMethod: "nequi",
    privacyPolicyVersion: "2026-07-14",
    shippingMethodCode: "recogida-local",
    termsVersion: "2026-07-14",
  },
  checkoutAttemptId: "50000000-0000-4000-8000-000000000001",
};

describe("createOrderRequestFingerprint", () => {
  it("is stable when item order changes", () => {
    const reorderedRequest: CreateOrderRequest = {
      ...request,
      checkout: {
        ...request.checkout,
        items: [...request.checkout.items].reverse(),
      },
    };

    expect(createOrderRequestFingerprint(reorderedRequest)).toBe(
      createOrderRequestFingerprint(request),
    );
  });

  it("changes when order contents change", () => {
    const changedRequest: CreateOrderRequest = {
      ...request,
      checkout: {
        ...request.checkout,
        items: [{ ...request.checkout.items[0], quantity: 3 }],
      },
    };

    expect(createOrderRequestFingerprint(changedRequest)).not.toBe(
      createOrderRequestFingerprint(request),
    );
  });
});
