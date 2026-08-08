"use client";

import { useActionState } from "react";

import {
  advanceOrderAction,
  type AdvanceOrderState,
} from "@/app/admin/pedidos/[orderId]/actions";

const initialState: AdvanceOrderState = {};
const inputClass =
  "h-10 w-full min-w-0 rounded-xl border border-white/20 bg-white/10 px-3 text-sm text-white placeholder:text-white/45 outline-none focus:border-brand";

export function ShipmentForm({ orderId }: { orderId: string }) {
  const [state, formAction, pending] = useActionState(
    advanceOrderAction,
    initialState,
  );

  return (
    <form
      action={formAction}
      className="mt-5 grid gap-3 border-t border-white/15 pt-5"
    >
      <input name="orderId" type="hidden" value={orderId} />
      <input name="shipmentForm" type="hidden" value="1" />
      <p className="text-sm font-bold">Registrar despacho</p>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
        <label className="grid gap-1 text-xs font-semibold text-white/75">
          Transportadora
          <input
            className={inputClass}
            maxLength={120}
            name="carrier"
            placeholder="Servientrega, Interrapidísimo…"
            required
          />
        </label>
        <label className="grid gap-1 text-xs font-semibold text-white/75">
          Número de guía
          <input
            className={inputClass}
            maxLength={120}
            name="trackingNumber"
            required
          />
        </label>
        <label className="grid gap-1 text-xs font-semibold text-white/75">
          Enlace de rastreo (opcional)
          <input
            className={inputClass}
            maxLength={500}
            name="trackingUrl"
            placeholder="https://…"
            type="url"
          />
        </label>
        <label className="grid gap-1 text-xs font-semibold text-white/75">
          Entrega estimada (opcional)
          <input
            className={inputClass}
            name="estimatedDeliveryAt"
            type="date"
          />
        </label>
      </div>
      <button
        className="bg-brand text-foreground min-h-11 rounded-xl px-5 text-sm font-extrabold transition hover:bg-white disabled:bg-slate-400"
        disabled={pending}
        type="submit"
      >
        {pending ? "Registrando…" : "Marcar como enviado"}
      </button>
      {state.error || state.success ? (
        <p
          className={`text-xs ${state.error ? "text-red-200" : "text-emerald-200"}`}
          role="status"
        >
          {state.error ?? state.success}
        </p>
      ) : null}
    </form>
  );
}
