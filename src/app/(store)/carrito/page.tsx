import type { Metadata } from "next";

import { CartView } from "@/components/cart/cart-view";

export const metadata: Metadata = {
  title: "Carrito",
  description: "Revisa los productos seleccionados antes del checkout.",
};

export default function CartPage() {
  return (
    <main className="flex-1 bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
        <p className="text-sm font-bold tracking-widest text-cyan-700 uppercase">
          Tu compra
        </p>
        <h1 className="mt-2 mb-8 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
          Carrito
        </h1>
        <CartView />
      </div>
    </main>
  );
}
