import { ZodError } from "zod";

import { checkoutQuoteRepository } from "@/db/queries/checkout";
import { checkoutQuoteRequestSchema } from "@/features/checkout/checkout-schema";
import {
  CheckoutQuoteError,
  createCheckoutQuote,
} from "@/features/checkout/checkout-service";
import { releaseExpiredOrderReservations } from "@/features/orders/order-service";

export async function POST(request: Request) {
  try {
    const input = checkoutQuoteRequestSchema.parse(await request.json());
    await releaseExpiredOrderReservations();
    const quote = await createCheckoutQuote(input, checkoutQuoteRepository);

    return Response.json({ ok: true, quote });
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
