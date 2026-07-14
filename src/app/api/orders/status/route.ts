import { ZodError } from "zod";

import { getPublicOrderStatus } from "@/db/queries/public-orders";
import { orderLookupInputSchema } from "@/features/orders/order-lookup";

export async function POST(request: Request) {
  try {
    const input = orderLookupInputSchema.parse(await request.json());
    const order = await getPublicOrderStatus(input.reference, input.email);

    if (!order) {
      return Response.json(
        {
          code: "ORDER_NOT_FOUND",
          message:
            "No encontramos un pedido que coincida con esa referencia y correo.",
          ok: false,
        },
        { status: 404 },
      );
    }

    return Response.json(
      { ok: true, order },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return Response.json(
        {
          code: "INVALID_REQUEST",
          message: error.issues[0]?.message ?? "Revisa los datos enviados.",
          ok: false,
        },
        { status: 400 },
      );
    }

    return Response.json(
      {
        code: "INTERNAL_ERROR",
        message: "No pudimos consultar el pedido. Inténtalo nuevamente.",
        ok: false,
      },
      { status: 500 },
    );
  }
}
