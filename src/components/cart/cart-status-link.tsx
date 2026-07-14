"use client";

import Link from "next/link";

import { countCartItems } from "@/features/cart/cart-rules";
import { useCartStore } from "@/stores/cart-store";

export function CartStatusLink() {
  const hasHydrated = useCartStore((state) => state.hasHydrated);
  const items = useCartStore((state) => state.items);
  const quantity = hasHydrated ? countCartItems(items) : 0;

  return (
    <Link
      href="/carrito"
      className="inline-flex items-center gap-1 transition-colors hover:text-cyan-700"
      aria-label={`Carrito, ${quantity} ${quantity === 1 ? "producto" : "productos"}`}
    >
      Carrito
      <span className="inline-flex min-w-5 justify-center rounded-full bg-slate-950 px-1.5 py-0.5 text-[11px] text-white">
        {quantity}
      </span>
    </Link>
  );
}
