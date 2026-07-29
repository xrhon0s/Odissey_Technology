import type { Metadata } from "next";

import { CartView } from "@/components/cart/cart-view";
import { privatePageRobots } from "@/features/seo/metadata";

export const metadata: Metadata = {
  title: "Carrito",
  description: "Revisa los productos seleccionados antes del checkout.",
  robots: privatePageRobots,
};

export default function CartPage() {
  return (
    <main id="main-content" tabIndex={-1} className="bg-background flex-1">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
        <p className="text-brand-dark flex items-center gap-2 text-xs font-semibold tracking-[0.18em] uppercase">
          <span
            className="bg-accent h-0.5 w-5 rounded-full"
            aria-hidden="true"
          />
          Tu compra
        </p>
        <h1 className="font-display text-foreground mt-3 text-4xl font-bold tracking-[-0.045em] sm:text-5xl">
          Tu carrito
        </h1>
        <p className="text-muted mt-3 mb-8 max-w-2xl leading-7">
          Revisa tus productos antes de elegir la entrega y el método de pago.
        </p>
        <CartView />
      </div>
    </main>
  );
}
