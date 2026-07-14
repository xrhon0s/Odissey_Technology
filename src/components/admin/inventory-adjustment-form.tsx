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
      className="mt-4 grid gap-3 sm:grid-cols-[120px_1fr_auto]"
    >
      <input type="hidden" name="variantId" value={variantId} />
      <label className="grid gap-1 text-xs font-semibold text-slate-600">
        Existencia total
        <input
          name="targetQuantity"
          type="number"
          min={0}
          max={1_000_000}
          defaultValue={currentQuantity}
          required
          className="h-10 rounded-lg border border-slate-300 px-3 text-sm text-slate-950"
        />
      </label>
      <label className="grid gap-1 text-xs font-semibold text-slate-600">
        Motivo del ajuste
        <input
          name="reason"
          maxLength={300}
          placeholder="Compra, conteo físico, corrección…"
          required
          className="h-10 rounded-lg border border-slate-300 px-3 text-sm text-slate-950"
        />
      </label>
      <button
        type="submit"
        disabled={isPending}
        className="h-10 self-end rounded-lg bg-slate-950 px-4 text-xs font-bold text-white hover:bg-slate-800 disabled:bg-slate-400"
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
