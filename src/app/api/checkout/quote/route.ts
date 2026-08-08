import { ZodError } from "zod";

import { checkoutQuoteRepository } from "@/db/queries/checkout";
import { getPublicStoreSettings } from "@/db/queries/store-settings";
import { checkoutQuoteRequestSchema } from "@/features/checkout/checkout-schema";
import {
  CheckoutQuoteError,
  createCheckoutQuote,
} from "@/features/checkout/checkout-service";
import { releaseExpiredOrderReservations } from "@/features/orders/order-service";
import { isManualPaymentMethodAvailable } from "@/features/payments/payment-methods";
import {
  enforceRateLimit,
  invalidBodyResponse,
  InvalidRequestBodyError,
  readBoundedJson,
} from "@/features/security/public-api-security";

export async function POST(request: Request) {
  try {
    const input = checkoutQuoteRequestSchema.parse(
      await readBoundedJson(request),
    );
    const rateLimitResponse = await enforceRateLimit(request, {
      limit: 40,
      scope: "checkout_quote_ip",
      windowMs: 10 * 60 * 1000,
    });
    if (rateLimitResponse) return rateLimitResponse;

    const settings = await getPublicStoreSettings();

    if (!isManualPaymentMethodAvailable(input.paymentMethod, settings)) {
      throw new CheckoutQuoteError(
        "INVALID_PAYMENT_METHOD",
        "Este método de pago no está disponible en este momento.",
      );
    }

    await releaseExpiredOrderReservations();
    const quote = await createCheckoutQuote(input, checkoutQuoteRepository);

    return Response.json({ ok: true, quote });
  } catch (error) {
    if (error instanceof InvalidRequestBodyError) {
      return invalidBodyResponse(error);
    }

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

    if (error instanceof CheckoutQuoteError) {
      return Response.json(
        { code: error.code, message: error.message, ok: false },
        { status: 409 },
      );
    }

    return Response.json(
      {
        code: "INTERNAL_ERROR",
        message: "No pudimos calcular la compra. Inténtalo de nuevo.",
        ok: false,
      },
      { status: 500 },
    );
  }
}
