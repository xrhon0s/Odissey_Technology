import { ZodError } from "zod";

import { getPublicStoreSettings } from "@/db/queries/store-settings";
import { CheckoutQuoteError } from "@/features/checkout/checkout-service";
import { createOrderRequestSchema } from "@/features/orders/order-schema";
import {
  createPendingOrder,
  OrderCreationError,
} from "@/features/orders/order-service";
import {
  buildPaymentInstructions,
  isManualPaymentMethodAvailable,
} from "@/features/payments/payment-methods";

export async function POST(request: Request) {
  try {
    const input = createOrderRequestSchema.parse(await request.json());
    const settings = await getPublicStoreSettings();

    if (
      !isManualPaymentMethodAvailable(input.checkout.paymentMethod, settings)
    ) {
      throw new CheckoutQuoteError(
        "INVALID_PAYMENT_METHOD",
        "Este método de pago no está disponible en este momento.",
      );
    }

    const order = await createPendingOrder(input);
    const paymentInstructions = buildPaymentInstructions(
      order.paymentMethod,
      settings,
    );

    return Response.json(
      { ok: true, order: { ...order, paymentInstructions } },
      { status: order.reused ? 200 : 201 },
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return Response.json(
        {
          code: "INVALID_REQUEST",
          message: "Revisa los datos enviados e inténtalo de nuevo.",
          ok: false,
        },
        { status: 400 },
      );
    }

    if (
      error instanceof CheckoutQuoteError ||
      error instanceof OrderCreationError
    ) {
      return Response.json(
        { code: error.code, message: error.message, ok: false },
        { status: 409 },
      );
    }

    return Response.json(
      {
        code: "INTERNAL_ERROR",
        message: "No pudimos crear el pedido. Inténtalo nuevamente.",
        ok: false,
      },
      { status: 500 },
    );
  }
}
