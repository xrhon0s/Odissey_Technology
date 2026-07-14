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

  function selectVariant(variantId: string) {
    setSelectedVariantId(variantId);
    setQuantity(1);
    setConfirmation("");
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
    <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-5">
      <label className="grid gap-2 text-sm font-bold text-slate-950">
        Selecciona una variante
        <select
          value={selectedVariantId}
          onChange={(event) => selectVariant(event.target.value)}
          className="h-12 rounded-xl border border-slate-300 bg-white px-3 font-normal"
        >
          {variants.map((variant) => (
            <option key={variant.id} value={variant.id}>
              {variant.name} · {formatCurrency(variant.priceInCop)}
              {variant.availableQuantity < 1 ? " · Agotado" : ""}
            </option>
          ))}
        </select>
      </label>

      <div className="mt-5 flex items-end gap-3">
        <label className="grid w-24 gap-2 text-sm font-bold text-slate-950">
          Cantidad
          <input
            type="number"
            min={1}
            max={Math.max(selectedVariant.availableQuantity, 1)}
            value={quantity}
            disabled={!canAdd}
            onChange={(event) =>
              setQuantity(
                clampCartQuantity(
                  Number(event.target.value),
                  selectedVariant.availableQuantity,
                ),
              )
            }
            className="h-12 rounded-xl border border-slate-300 bg-white px-3 text-center font-normal disabled:bg-slate-100"
          />
        </label>
        <button
          type="button"
          disabled={!canAdd}
          onClick={addSelectedVariant}
          className="h-12 flex-1 rounded-xl bg-cyan-500 px-5 text-sm font-bold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-600"
        >
          {canAdd ? "Agregar al carrito" : "Producto agotado"}
        </button>
      </div>
      <p className="mt-3 text-xs text-slate-500">
        {canAdd
          ? `${selectedVariant.availableQuantity} unidades disponibles`
          : "Esta variante no tiene existencias."}
      </p>
      <p
        aria-live="polite"
        className="mt-3 text-sm font-semibold text-emerald-700"
      >
        {confirmation}
      </p>
    </div>
  );
}
