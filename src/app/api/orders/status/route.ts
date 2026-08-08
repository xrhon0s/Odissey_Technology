import { ZodError } from "zod";

import { getPublicOrderStatus } from "@/db/queries/public-orders";
import { getPublicStoreSettings } from "@/db/queries/store-settings";
import { orderLookupInputSchema } from "@/features/orders/order-lookup";
import {
  buildPaymentInstructions,
  manualPaymentMethods,
  manualPaymentMethodSchema,
} from "@/features/payments/payment-methods";
import { buildPaymentProofWhatsAppUrl } from "@/features/store/store-settings";
import {
  enforceRateLimit,
  invalidBodyResponse,
  InvalidRequestBodyError,
  readBoundedJson,
} from "@/features/security/public-api-security";

export async function POST(request: Request) {
  try {
    const input = orderLookupInputSchema.parse(await readBoundedJson(request));
    const ipRateLimitResponse = await enforceRateLimit(request, {
      limit: 12,
      scope: "order_lookup_ip",
      windowMs: 15 * 60 * 1000,
    });
    if (ipRateLimitResponse) return ipRateLimitResponse;

    const lookupRateLimitResponse = await enforceRateLimit(
      request,
      {
        limit: 6,
        scope: "order_lookup_pair",
        windowMs: 15 * 60 * 1000,
      },
      `${input.reference}:${input.email}`,
    );
    if (lookupRateLimitResponse) return lookupRateLimitResponse;

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

    const paymentMethod = manualPaymentMethodSchema.safeParse(
      order.paymentMethod,
    );
    const settings = await getPublicStoreSettings();
    const basePaymentInstructions =
      order.paymentStatus === "pending" && paymentMethod.success
        ? buildPaymentInstructions(paymentMethod.data, settings)
        : null;
    const paymentName = paymentMethod.success
      ? (manualPaymentMethods.find(
          (method) => method.code === paymentMethod.data,
        )?.name ?? "Pago manual")
      : "Pago manual";
    const paymentInstructions = basePaymentInstructions
      ? {
          ...basePaymentInstructions,
          confirmationUrl:
            paymentMethod.success && paymentMethod.data !== "cash_on_delivery"
              ? buildPaymentProofWhatsAppUrl(settings, {
                  paymentMethodName: paymentName,
                  reference: order.reference,
                  totalInCop: order.totalInCop,
                })
              : null,
        }
      : null;

    return Response.json(
      { ok: true, order: { ...order, paymentInstructions } },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    if (error instanceof InvalidRequestBodyError) {
      return invalidBodyResponse(error);
    }

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
