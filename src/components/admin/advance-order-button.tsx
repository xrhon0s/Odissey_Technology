"use client";

import { useActionState } from "react";

import {
  advanceOrderAction,
  type AdvanceOrderState,
} from "@/app/admin/pedidos/[orderId]/actions";

const initialState: AdvanceOrderState = {};

export function AdvanceOrderButton({
  label,
  orderId,
}: {
  label: string;
  orderId: string;
}) {
  const [state, formAction, isPending] = useActionState(
    advanceOrderAction,
    initialState,
  );

  return (
    <form action={formAction}>
      <input type="hidden" name="orderId" value={orderId} />
      <button
        type="submit"
        disabled={isPending}
        className="h-11 rounded-xl bg-cyan-700 px-4 text-sm font-bold text-white hover:bg-cyan-600 disabled:cursor-not-allowed disabled:bg-slate-400"
      >
        {isPending ? "Actualizando…" : label}
      </button>
      {(state.error || state.success) && (
        <p
          role="status"
          className={`mt-2 text-xs ${state.error ? "text-red-700" : "text-emerald-700"}`}
        >
          {state.error ?? state.success}
        </p>
      )}
    </form>
  );
}
