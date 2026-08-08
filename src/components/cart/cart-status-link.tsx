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
      className="bg-foreground hover:bg-brand hover:text-foreground inline-flex items-center gap-2 rounded-full px-3 py-2 text-white transition sm:px-4"
      aria-label={`Carrito, ${quantity} ${quantity === 1 ? "producto" : "productos"}`}
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="none"
        className="size-4"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M3 4h2l2.1 10.1a2 2 0 0 0 2 1.6h7.8a2 2 0 0 0 2-1.6L20 7H6" />
        <circle cx="9" cy="20" r="1" />
        <circle cx="17" cy="20" r="1" />
      </svg>
      <span className="hidden sm:inline">Carrito</span>
      <span className="text-foreground inline-flex min-w-5 justify-center rounded-full bg-white px-1.5 py-0.5 text-[11px] font-bold">
        {quantity}
      </span>
    </Link>
  );
}
