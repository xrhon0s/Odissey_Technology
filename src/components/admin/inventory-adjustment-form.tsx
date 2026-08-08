"use client";

import { useActionState } from "react";

import {
  adjustInventoryAction,
  type InventoryAdjustmentState,
} from "@/app/admin/inventario/actions";

const initialState: InventoryAdjustmentState = {};

export function InventoryAdjustmentForm({
  currentQuantity,
  variantId,
}: {
  currentQuantity: number;
  variantId: string;
}) {
  const [state, formAction, isPending] = useActionState(
    adjustInventoryAction,
    initialState,
  );

  return (
    <form
      action={formAction}
      className="border-line mt-5 grid gap-3 border-t pt-5 sm:grid-cols-[140px_1fr_auto]"
    >
      <input type="hidden" name="variantId" value={variantId} />
      <label className="text-muted grid gap-1.5 text-xs font-semibold">
        Existencia total
        <input
          name="targetQuantity"
          type="number"
          min={0}
          max={1_000_000}
          defaultValue={currentQuantity}
          required
          className="border-line bg-surface text-foreground focus:border-brand h-11 rounded-xl border px-3 text-sm outline-none"
        />
      </label>
      <label className="text-muted grid gap-1.5 text-xs font-semibold">
        Motivo del ajuste
        <input
          name="reason"
          maxLength={300}
          placeholder="Compra, conteo físico, corrección…"
          required
          className="border-line bg-surface text-foreground focus:border-brand h-11 rounded-xl border px-3 text-sm outline-none"
        />
      </label>
      <button
        type="submit"
        disabled={isPending}
        className="bg-foreground hover:bg-brand-dark h-11 self-end rounded-xl px-5 text-xs font-extrabold text-white transition disabled:bg-slate-400"
      >
        {isPending ? "Guardando…" : "Ajustar"}
      </button>
      {(state.error || state.success) && (
        <p
          role="status"
          className={`text-xs sm:col-span-3 ${state.error ? "text-red-700" : "text-emerald-700"}`}
        >
          {state.error ?? state.success}
        </p>
      )}
    </form>
  );
}
