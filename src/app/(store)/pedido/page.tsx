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
    <main className="flex-1 bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
        <p className="text-sm font-bold tracking-widest text-cyan-700 uppercase">
          Seguimiento
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
          Consulta tu pedido
        </h1>
        <p className="mt-3 mb-8 max-w-2xl text-slate-600">
          Revisa el estado del pedido y del pago con los datos de tu compra.
        </p>
        <Suspense fallback={<p>Preparando consulta…</p>}>
          <OrderLookupForm />
        </Suspense>
      </div>
    </main>
  );
}
