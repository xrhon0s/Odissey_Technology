import type { CheckoutQuoteRequest } from "./checkout-schema";
import { isPaymentMethodEligible } from "@/features/payments/payment-methods";

export type CheckoutVariant = {
  availableQuantity: number;
  priceInCop: number;
  productName: string;
  sku: string;
  variantId: string;
  variantName: string;
};

export type CheckoutShippingMethod = {
  code: string;
  description: string;
  name: string;
  priceInCop: number;
  requiresAddress: boolean;
};

export type CheckoutQuoteRepository = {
  findActiveShippingMethod: (
    code: string,
  ) => Promise<CheckoutShippingMethod | null>;
  findActiveVariants: (variantIds: string[]) => Promise<CheckoutVariant[]>;
};

export type CheckoutQuote = {
  items: Array<
    CheckoutVariant & {
      lineTotalInCop: number;
      quantity: number;
    }
  >;
  shippingInCop: number;
  shippingMethod: CheckoutShippingMethod;
  subtotalInCop: number;
  totalInCop: number;
};

export type CheckoutQuoteErrorCode =
  | "ADDRESS_REQUIRED"
  | "INVALID_ITEM"
  | "INVALID_PAYMENT_METHOD"
  | "INVALID_SHIPPING_METHOD"
  | "OUT_OF_STOCK";

export class CheckoutQuoteError extends Error {
  constructor(
    public readonly code: CheckoutQuoteErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "CheckoutQuoteError";
  }
}

export async function createCheckoutQuote(
  input: CheckoutQuoteRequest,
  repository: CheckoutQuoteRepository,
): Promise<CheckoutQuote> {
  const [shippingMethod, variants] = await Promise.all([
    repository.findActiveShippingMethod(input.shippingMethodCode),
    repository.findActiveVariants(input.items.map((item) => item.variantId)),
  ]);

  if (!shippingMethod) {
    throw new CheckoutQuoteError(
      "INVALID_SHIPPING_METHOD",
      "El método de envío ya no está disponible.",
    );
  }

  if (shippingMethod.requiresAddress && !input.address) {
    throw new CheckoutQuoteError(
      "ADDRESS_REQUIRED",
      "Este método de envío requiere una dirección de entrega.",
    );
  }

  if (!isPaymentMethodEligible(input)) {
    throw new CheckoutQuoteError(
      "INVALID_PAYMENT_METHOD",
      "El pago en efectivo contraentrega solo está disponible en el área metropolitana de Medellín.",
    );
  }

  const variantsById = new Map(
    variants.map((variant) => [variant.variantId, variant]),
  );
  const quotedItems = input.items.map((requestedItem) => {
    const variant = variantsById.get(requestedItem.variantId);

    if (!variant) {
      throw new CheckoutQuoteError(
        "INVALID_ITEM",
        "Uno de los productos ya no está disponible.",
      );
    }

    if (requestedItem.quantity > variant.availableQuantity) {
      throw new CheckoutQuoteError(
        "OUT_OF_STOCK",
        `No hay unidades suficientes de ${variant.productName} (${variant.variantName}).`,
      );
    }

    return {
      ...variant,
      lineTotalInCop: variant.priceInCop * requestedItem.quantity,
      quantity: requestedItem.quantity,
    };
  });
  const subtotalInCop = quotedItems.reduce(
    (total, item) => total + item.lineTotalInCop,
    0,
  );

  return {
    items: quotedItems,
    shippingInCop: shippingMethod.priceInCop,
    shippingMethod,
    subtotalInCop,
    totalInCop: subtotalInCop + shippingMethod.priceInCop,
  };
}
