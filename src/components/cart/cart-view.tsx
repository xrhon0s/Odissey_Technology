"use client";

import Image from "next/image";
import Link from "next/link";

import { calculateCartTotal } from "@/features/cart/cart-rules";
import { formatCurrency } from "@/lib/format-currency";
import { useCartStore } from "@/stores/cart-store";

export function CartView() {
  const clear = useCartStore((state) => state.clear);
  const hasHydrated = useCartStore((state) => state.hasHydrated);
  const items = useCartStore((state) => state.items);
  const removeItem = useCartStore((state) => state.removeItem);
  const setQuantity = useCartStore((state) => state.setQuantity);

  if (!hasHydrated) {
    return (
      <div aria-busy="true" className="animate-pulse space-y-4">
        <div className="h-32 rounded-2xl bg-slate-200" />
        <div className="h-32 rounded-2xl bg-slate-200" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
        <h2 className="text-xl font-bold text-slate-950">
          Tu carrito está vacío
        </h2>
        <p className="mt-2 text-slate-600">
          Explora el catálogo y agrega una variante para comenzar.
        </p>
        <Link
          href="/catalogo"
          className="mt-6 inline-flex rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white"
        >
          Ver catálogo
        </Link>
      </div>
    );
  }

  const total = calculateCartTotal(items);

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_340px] lg:items-start">
      <div className="space-y-4">
        {items.map((item) => (
          <article
            key={item.variantId}
            className="grid grid-cols-[88px_1fr] gap-4 rounded-2xl border border-slate-200 bg-white p-4 sm:grid-cols-[112px_1fr_auto]"
          >
            <div className="relative aspect-square overflow-hidden rounded-xl bg-slate-100">
              {item.imageUrl ? (
                <Image
                  src={item.imageUrl}
                  alt={item.imageAlt ?? item.productName}
                  fill
                  sizes="112px"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center p-2 text-center text-xs text-slate-500">
                  Sin imagen
                </div>
              )}
            </div>
            <div>
              <Link
                href={`/producto/${item.productSlug}`}
                className="font-bold text-slate-950 hover:text-cyan-800"
              >
                {item.productName}
              </Link>
              <p className="mt-1 text-sm text-slate-600">{item.variantName}</p>
              <p className="mt-1 text-xs text-slate-500">SKU: {item.sku}</p>
              <label className="mt-4 grid max-w-28 gap-1 text-xs font-semibold text-slate-700">
                Cantidad
                <input
                  type="number"
                  min={1}
                  max={item.availableQuantity}
                  value={item.quantity}
                  onChange={(event) =>
                    setQuantity(item.variantId, Number(event.target.value))
                  }
                  className="h-10 rounded-lg border border-slate-300 px-3"
                />
              </label>
              <button
                type="button"
                onClick={() => removeItem(item.variantId)}
                className="mt-3 text-xs font-semibold text-red-700 hover:underline"
              >
                Eliminar
              </button>
            </div>
            <p className="col-span-2 text-right font-bold text-slate-950 sm:col-span-1">
              {formatCurrency(item.unitPriceInCop * item.quantity)}
            </p>
          </article>
        ))}
      </div>

      <aside className="rounded-2xl bg-slate-950 p-6 text-white lg:sticky lg:top-6">
        <h2 className="text-lg font-bold">Resumen</h2>
        <div className="mt-5 flex justify-between border-t border-slate-700 pt-5">
          <span>Total parcial</span>
          <strong>{formatCurrency(total)}</strong>
        </div>
        <p className="mt-3 text-xs leading-5 text-slate-400">
          Envío y disponibilidad final se confirmarán durante el checkout.
        </p>
        <button
          type="button"
          disabled
          className="mt-6 h-12 w-full cursor-not-allowed rounded-xl bg-slate-700 text-sm font-semibold text-slate-300"
        >
          Checkout próximamente
        </button>
        <button
          type="button"
          onClick={clear}
          className="mt-4 w-full text-sm font-semibold text-slate-300 hover:text-white"
        >
          Vaciar carrito
        </button>
      </aside>
    </div>
  );
}
