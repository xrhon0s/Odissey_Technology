import type { Metadata } from "next";

import { CheckoutForm } from "@/components/checkout/checkout-form";
import { listActiveShippingMethods } from "@/db/queries/checkout";
import { getPublicStoreSettings } from "@/db/queries/store-settings";
import { getAvailableManualPaymentMethods } from "@/features/payments/payment-methods";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Valida tus datos, productos y método de entrega.",
};

export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const [shippingMethods, settings] = await Promise.all([
    listActiveShippingMethods(),
    getPublicStoreSettings(),
  ]);
  const paymentMethods = getAvailableManualPaymentMethods(settings);

  return (
    <main id="main-content" tabIndex={-1} className="bg-background flex-1">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
        <p className="text-brand-dark flex items-center gap-2 text-xs font-semibold tracking-[0.18em] uppercase">
          <span
            className="bg-accent h-0.5 w-5 rounded-full"
            aria-hidden="true"
          />
          Finaliza tu compra
        </p>
        <h1 className="font-display text-foreground mt-3 text-4xl font-bold tracking-[-0.045em] sm:text-5xl">
          Datos de entrega
        </h1>
        <p className="text-muted mt-3 mb-8 max-w-2xl leading-7">
          Confirma tus datos, la forma de entrega y cómo quieres pagar.
        </p>
        <CheckoutForm
          paymentMethods={paymentMethods}
          shippingMethods={shippingMethods}
        />
      </div>
    </main>
  );
}
