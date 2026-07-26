import type { Metadata } from "next";
import { Suspense } from "react";

import { OrderLookupForm } from "@/components/orders/order-lookup-form";

export const metadata: Metadata = {
  description: "Consulta el estado de un pedido de Odissey Technology.",
  title: "Consulta tu pedido",
};

export const dynamic = "force-dynamic";

export default function OrderLookupPage() {
  return (
    <main id="main-content" tabIndex={-1} className="bg-background flex-1">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
        <p className="text-brand-dark flex items-center gap-2 text-xs font-semibold tracking-[0.18em] uppercase">
          <span
            className="bg-accent h-0.5 w-5 rounded-full"
            aria-hidden="true"
          />
          Seguimiento
        </p>
        <h1 className="font-display text-foreground mt-3 text-4xl font-bold tracking-[-0.045em] sm:text-5xl">
          Consulta tu pedido
        </h1>
        <p className="text-muted mt-3 mb-8 max-w-2xl leading-7">
          Revisa el estado del pedido y del pago con los datos de tu compra.
        </p>
        <Suspense
          fallback={
            <div className="skeleton-shimmer bg-surface-muted h-64 rounded-[1.5rem]" />
          }
        >
          <OrderLookupForm />
        </Suspense>
      </div>
    </main>
  );
}
