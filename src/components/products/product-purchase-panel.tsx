"use client";

import { useState } from "react";

import { clampCartQuantity } from "@/features/cart/cart-rules";
import { formatCurrency } from "@/lib/format-currency";
import { useCartStore } from "@/stores/cart-store";

type PurchasableVariant = {
  availableQuantity: number;
  compareAtPriceInCop: number | null;
  id: string;
  name: string;
  priceInCop: number;
  sku: string;
};

type ProductPurchasePanelProps = {
  imageAlt: string | null;
  imageUrl: string | null;
  productName: string;
  productSlug: string;
  variants: PurchasableVariant[];
};

export function ProductPurchasePanel({
  imageAlt,
  imageUrl,
  productName,
  productSlug,
  variants,
}: ProductPurchasePanelProps) {
  const firstAvailableVariant =
    variants.find((variant) => variant.availableQuantity > 0) ?? variants[0];
  const [selectedVariantId, setSelectedVariantId] = useState(
    firstAvailableVariant?.id ?? "",
  );
  const [quantity, setQuantity] = useState(1);
  const [confirmation, setConfirmation] = useState("");
  const addItem = useCartStore((state) => state.addItem);
  const selectedVariant = variants.find(
    (variant) => variant.id === selectedVariantId,
  );

  if (!selectedVariant) return null;

  const canAdd = selectedVariant.availableQuantity > 0;
  const availableQuantity = selectedVariant.availableQuantity;

  function selectVariant(variantId: string) {
    setSelectedVariantId(variantId);
    setQuantity(1);
    setConfirmation("");
  }

  function changeQuantity(delta: number) {
    setQuantity((current) =>
      clampCartQuantity(current + delta, availableQuantity),
    );
  }

  function addSelectedVariant() {
    if (!selectedVariant || selectedVariant.availableQuantity < 1) return;

    const safeQuantity = clampCartQuantity(
      quantity,
      selectedVariant.availableQuantity,
    );
    addItem({
      availableQuantity: selectedVariant.availableQuantity,
      imageAlt,
      imageUrl,
      productName,
      productSlug,
      quantity: safeQuantity,
      sku: selectedVariant.sku,
      unitPriceInCop: selectedVariant.priceInCop,
      variantId: selectedVariant.id,
      variantName: selectedVariant.name,
    });
    setQuantity(1);
    setConfirmation(`${selectedVariant.name} fue agregado al carrito.`);
  }

  return (
    <div className="border-line mt-8 border-t pt-7">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-display text-foreground text-3xl font-bold tracking-[-0.04em]">
            {formatCurrency(selectedVariant.priceInCop)}
          </p>
          {selectedVariant.compareAtPriceInCop ? (
            <p className="text-muted mt-1 text-sm font-bold line-through">
              {formatCurrency(selectedVariant.compareAtPriceInCop)}
            </p>
          ) : null}
        </div>
        <p
          className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold ${canAdd ? "text-success bg-[#e4f5ee]" : "bg-surface-muted text-muted"}`}
        >
          <span
            aria-hidden="true"
            className={`size-2 rounded-full ${canAdd ? "bg-success" : "bg-muted"}`}
          />
          {canAdd
            ? `${selectedVariant.availableQuantity} disponibles`
            : "Agotado"}
        </p>
      </div>

      <fieldset className="mt-7">
        <legend className="text-foreground text-xs font-bold tracking-[0.12em] uppercase">
          Elige una opción
        </legend>
        <div className="mt-3 flex flex-wrap gap-2">
          {variants.map((variant) => {
            const isSelected = variant.id === selectedVariantId;

            return (
              <button
                key={variant.id}
                type="button"
                aria-pressed={isSelected}
                onClick={() => selectVariant(variant.id)}
                className={`rounded-full border px-4 py-2.5 text-sm font-bold transition ${
                  isSelected
                    ? "border-brand bg-brand text-white"
                    : "border-line bg-surface text-foreground hover:border-brand"
                } ${variant.availableQuantity < 1 ? "opacity-45" : ""}`}
              >
                {variant.name}
                {variant.availableQuantity < 1 ? " · Agotado" : ""}
              </button>
            );
          })}
        </div>
      </fieldset>

      <div className="mt-6 grid gap-3 sm:grid-cols-[130px_1fr]">
        <div className="border-line bg-surface flex h-13 items-center justify-between rounded-full border px-2">
          <button
            type="button"
            onClick={() => changeQuantity(-1)}
            disabled={!canAdd || quantity <= 1}
            aria-label="Disminuir cantidad"
            className="hover:bg-surface-muted grid size-9 place-items-center rounded-full text-lg font-bold transition disabled:opacity-30"
          >
            −
          </button>
          <span
            className="min-w-6 text-center text-sm font-bold"
            aria-live="polite"
          >
            {quantity}
          </span>
          <button
            type="button"
            onClick={() => changeQuantity(1)}
            disabled={!canAdd || quantity >= selectedVariant.availableQuantity}
            aria-label="Aumentar cantidad"
            className="hover:bg-surface-muted grid size-9 place-items-center rounded-full text-lg font-bold transition disabled:opacity-30"
          >
            +
          </button>
        </div>
        <button
          type="button"
          disabled={!canAdd}
          onClick={addSelectedVariant}
          className="bg-brand hover:bg-brand-dark disabled:bg-surface-muted disabled:text-muted text-foreground h-13 rounded-full px-6 text-sm font-semibold transition hover:-translate-y-0.5 hover:text-white disabled:cursor-not-allowed"
        >
          {canAdd ? "Agregar al carrito" : "Producto agotado"}
        </button>
      </div>

      <p
        aria-live="polite"
        className="text-success mt-4 min-h-5 text-sm font-bold"
      >
        {confirmation}
      </p>
      <div className="text-muted mt-5 grid gap-2 text-xs font-bold sm:grid-cols-2">
        <p className="flex items-center gap-2">
          <span aria-hidden="true" className="text-brand-dark">
            ✓
          </span>
          Pago manual confirmado contigo
        </p>
        <p className="flex items-center gap-2">
          <span aria-hidden="true" className="text-brand-dark">
            ✓
          </span>
          Entrega coordinada después de comprar
        </p>
      </div>
    </div>
  );
}
