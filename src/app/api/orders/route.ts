import { ZodError } from "zod";

import { getPublicStoreSettings } from "@/db/queries/store-settings";
import { CheckoutQuoteError } from "@/features/checkout/checkout-service";
import { notifyOrderCreated } from "@/features/notifications/order-notifications";
import { createOrderRequestSchema } from "@/features/orders/order-schema";
import {
  createPendingOrder,
  OrderCreationError,
} from "@/features/orders/order-service";
import {
  buildPaymentInstructions,
  isManualPaymentMethodAvailable,
  manualPaymentMethods,
} from "@/features/payments/payment-methods";
import { buildPaymentProofWhatsAppUrl } from "@/features/store/store-settings";

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
    const basePaymentInstructions = buildPaymentInstructions(
      order.paymentMethod,
      settings,
    );
    const paymentName =
      manualPaymentMethods.find((method) => method.code === order.paymentMethod)
        ?.name ?? "Pago manual";
    const paymentInstructions = basePaymentInstructions
      ? {
          ...basePaymentInstructions,
          confirmationUrl:
            order.paymentMethod === "cash_on_delivery"
              ? null
              : buildPaymentProofWhatsAppUrl(settings, {
                  paymentMethodName: paymentName,
                  reference: order.reference,
                  totalInCop: order.totalInCop,
                }),
        }
      : null;

    if (!order.reused) {
      try {
        await notifyOrderCreated({
          customerEmail: input.checkout.customer.email,
          customerName: input.checkout.customer.fullName,
          orderId: order.id,
          reference: order.reference,
          settings,
          totalInCop: order.totalInCop,
        });
      } catch {
        // La entrega del correo nunca debe invalidar un pedido ya creado.
      }
    }

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
