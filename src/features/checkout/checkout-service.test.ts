import { describe, expect, it, vi } from "vitest";

import type { CheckoutQuoteRequest } from "./checkout-schema";
import {
  CheckoutQuoteError,
  createCheckoutQuote,
  type CheckoutQuoteRepository,
} from "./checkout-service";

const request: CheckoutQuoteRequest = {
  address: {
    addressLine1: "Calle 1 # 2-3",
    city: "Bogotá",
    department: "Cundinamarca",
  },
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
  shippingMethodCode: "envio-nacional",
};

function createRepository(availableQuantity = 5): CheckoutQuoteRepository {
  return {
    findActiveShippingMethod: vi.fn().mockResolvedValue({
      code: "envio-nacional",
      description: "Entrega nacional",
      name: "Envío nacional",
      priceInCop: 12_900,
      requiresAddress: true,
    }),
    findActiveVariants: vi.fn().mockResolvedValue([
      {
        availableQuantity,
        priceInCop: 89_900,
        productName: "Audífonos Nova",
        sku: "NOVA-BLK",
        variantId: request.items[0].variantId,
        variantName: "Negro",
      },
    ]),
  };
}

describe("createCheckoutQuote", () => {
  it("recalculates prices and totals from repository data", async () => {
    const quote = await createCheckoutQuote(request, createRepository());

    expect(quote.subtotalInCop).toBe(179_800);
    expect(quote.shippingInCop).toBe(12_900);
    expect(quote.totalInCop).toBe(192_700);
  });

  it("rejects quantities above current stock", async () => {
    await expect(
      createCheckoutQuote(request, createRepository(1)),
    ).rejects.toMatchObject({
      code: "OUT_OF_STOCK",
    } satisfies Partial<CheckoutQuoteError>);
  });

  it("requires an address when the shipping method needs one", async () => {
    await expect(
      createCheckoutQuote(
        { ...request, address: undefined },
        createRepository(),
      ),
    ).rejects.toMatchObject({
      code: "ADDRESS_REQUIRED",
    } satisfies Partial<CheckoutQuoteError>);
  });
});
