import type { Metadata } from "next";

import { CheckoutForm } from "@/components/checkout/checkout-form";
import { listActiveShippingMethods } from "@/db/queries/checkout";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Valida tus datos, productos y método de entrega.",
};

export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const shippingMethods = await listActiveShippingMethods();

  return (
    <main className="flex-1 bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
        <p className="text-sm font-bold tracking-widest text-cyan-700 uppercase">
          Compra como invitado
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
          Checkout
        </h1>
        <p className="mt-3 mb-8 max-w-2xl text-slate-600">
          Completa tus datos para validar el total y la disponibilidad antes de
          crear el pedido.
        </p>
        <CheckoutForm shippingMethods={shippingMethods} />
      </div>
    </main>
  );
}
