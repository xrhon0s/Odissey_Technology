import { ZodError } from "zod";

import { CheckoutQuoteError } from "@/features/checkout/checkout-service";
import { createOrderRequestSchema } from "@/features/orders/order-schema";
import {
  createPendingOrder,
  OrderCreationError,
} from "@/features/orders/order-service";

export async function POST(request: Request) {
  try {
    const input = createOrderRequestSchema.parse(await request.json());
    const order = await createPendingOrder(input);

    return Response.json(
      { ok: true, order },
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
