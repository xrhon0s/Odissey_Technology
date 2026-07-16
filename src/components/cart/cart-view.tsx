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
        <div className="skeleton-shimmer bg-surface-muted h-32 rounded-2xl" />
        <div className="skeleton-shimmer bg-surface-muted h-32 rounded-2xl" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="border-line bg-surface rounded-[1.75rem] border border-dashed px-6 py-16 text-center">
        <span
          aria-hidden="true"
          className="bg-brand-soft text-brand-dark mx-auto grid size-14 place-items-center rounded-full text-2xl"
        >
          ＋
        </span>
        <h2 className="font-display text-foreground mt-5 text-xl font-bold">
          Tu carrito está vacío
        </h2>
        <p className="text-muted mt-2">
          Explora el catálogo y encuentra tu próximo accesorio.
        </p>
        <Link
          href="/catalogo"
          className="bg-foreground hover:bg-brand-dark mt-6 inline-flex rounded-full px-6 py-3 text-sm font-semibold text-white transition"
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
            className="border-line bg-surface grid grid-cols-[88px_1fr] gap-4 rounded-[1.5rem] border p-4 transition hover:shadow-sm sm:grid-cols-[112px_1fr_auto]"
          >
            <div className="bg-surface-muted relative aspect-square overflow-hidden rounded-[1.15rem]">
              {item.imageUrl ? (
                <Image
                  src={item.imageUrl}
                  alt={item.imageAlt ?? item.productName}
                  fill
                  sizes="112px"
                  className="object-cover"
                />
              ) : (
                <div className="text-muted flex h-full items-center justify-center p-2 text-center text-xs">
                  Sin imagen
                </div>
              )}
            </div>
            <div>
              <Link
                href={`/producto/${item.productSlug}`}
                className="text-foreground hover:text-brand-dark font-bold transition"
              >
                {item.productName}
              </Link>
              <p className="text-muted mt-1 text-sm">{item.variantName}</p>
              <p className="text-muted mt-1 text-xs">SKU: {item.sku}</p>
              <label className="text-foreground mt-4 grid max-w-28 gap-1.5 text-xs font-semibold">
                Cantidad
                <input
                  type="number"
                  min={1}
                  max={item.availableQuantity}
                  value={item.quantity}
                  onChange={(event) =>
                    setQuantity(item.variantId, Number(event.target.value))
                  }
                  className="border-line bg-background focus:border-brand h-10 rounded-xl border px-3 outline-none"
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
            <p className="font-display text-foreground col-span-2 text-right font-bold sm:col-span-1">
              {formatCurrency(item.unitPriceInCop * item.quantity)}
            </p>
          </article>
        ))}
      </div>

      <aside className="bg-foreground rounded-[1.5rem] p-6 text-white lg:sticky lg:top-32">
        <p className="text-brand text-xs font-bold tracking-[0.16em] uppercase">
          Resumen
        </p>
        <h2 className="font-display mt-2 text-xl font-bold">
          Total de la compra
        </h2>
        <div className="mt-5 flex justify-between border-t border-white/15 pt-5">
          <span>Total parcial</span>
          <strong>{formatCurrency(total)}</strong>
        </div>
        <p className="mt-3 text-xs leading-5 text-slate-400">
          Envío y disponibilidad final se confirmarán durante el checkout.
        </p>
        <Link
          href="/checkout"
          className="bg-brand text-foreground mt-6 flex h-12 w-full items-center justify-center rounded-full text-sm font-bold transition hover:bg-white"
        >
          Continuar al checkout
        </Link>
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
