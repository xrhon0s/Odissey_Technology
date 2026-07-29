import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { OrderLookupForm } from "@/components/orders/order-lookup-form";
import { getCustomerIdentity } from "@/features/customers/customer-access";
import { privatePageRobots } from "@/features/seo/metadata";

export const metadata: Metadata = {
  description: "Consulta el estado de un pedido de Odissey Technology.",
  robots: privatePageRobots,
  title: "Consulta tu pedido",
};

export const dynamic = "force-dynamic";

export default async function OrderLookupPage() {
  const customer = await getCustomerIdentity();

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
        <aside className="border-brand/25 bg-brand-soft mb-6 flex flex-col gap-4 rounded-2xl border p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div>
            <p className="text-foreground font-bold">
              {customer
                ? "Tus compras vinculadas ya están organizadas."
                : "¿Compraste usando una cuenta?"}
            </p>
            <p className="text-muted mt-1 text-sm">
              {customer
                ? "Entra a tu historial sin escribir referencia ni correo."
                : "Inicia sesión para consultar todos tus pedidos vinculados en un solo lugar."}
            </p>
          </div>
          <Link
            className="bg-foreground hover:bg-brand-dark inline-flex h-11 shrink-0 items-center justify-center rounded-full px-5 text-sm font-bold text-white transition"
            href={customer ? "/cuenta" : "/cuenta/acceder"}
          >
            {customer ? "Ver mis pedidos" : "Ir a mi cuenta"} →
          </Link>
        </aside>
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
