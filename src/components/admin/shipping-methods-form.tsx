"use client";

import { useActionState } from "react";

import {
  createShippingMethodAction,
  type ShippingMethodActionState,
  updateShippingMethodAction,
} from "@/app/admin/configuracion/actions";
import { formatCurrency } from "@/lib/format-currency";

type ShippingMethod = {
  code: string;
  description: string;
  id: string;
  isActive: boolean;
  name: string;
  priceInCop: number;
  requiresAddress: boolean;
  sortOrder: number;
};

const initialState: ShippingMethodActionState = {};
const inputClass =
  "h-11 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-950";
const labelClass = "grid gap-1 text-sm font-semibold text-slate-700";

function ShippingMethodFields({ method }: { method?: ShippingMethod }) {
  return (
    <>
      <label className={labelClass}>
        Nombre
        <input
          className={inputClass}
          defaultValue={method?.name ?? ""}
          maxLength={120}
          name="name"
          required
        />
      </label>
      <label className={labelClass}>
        Código interno
        <input
          className={inputClass}
          defaultValue={method?.code ?? ""}
          maxLength={60}
          name="code"
          pattern="[a-z0-9]+(-[a-z0-9]+)*"
          placeholder="envio-metropolitano"
          required
        />
      </label>
      <label className={`${labelClass} sm:col-span-2`}>
        Descripción para el comprador
        <input
          className={inputClass}
          defaultValue={method?.description ?? ""}
          maxLength={500}
          minLength={5}
          name="description"
          required
        />
      </label>
      <label className={labelClass}>
        Precio en COP
        <input
          className={inputClass}
          defaultValue={method?.priceInCop ?? 0}
          max={10_000_000}
          min={0}
          name="priceInCop"
          required
          step={1}
          type="number"
        />
      </label>
      <label className={labelClass}>
        Orden de aparición
        <input
          className={inputClass}
          defaultValue={method?.sortOrder ?? 0}
          max={10_000}
          min={0}
          name="sortOrder"
          required
          step={1}
          type="number"
        />
      </label>
      <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
        <input
          defaultChecked={method?.requiresAddress ?? true}
          name="requiresAddress"
          type="checkbox"
        />
        Solicitar dirección
      </label>
      <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
        <input
          defaultChecked={method?.isActive ?? true}
          name="isActive"
          type="checkbox"
        />
        Disponible en checkout
      </label>
    </>
  );
}

function ExistingShippingMethodForm({ method }: { method: ShippingMethod }) {
  const [state, action, pending] = useActionState(
    updateShippingMethodAction,
    initialState,
  );

  return (
    <form
      action={action}
      className="grid gap-4 rounded-xl border border-slate-200 bg-white p-5 sm:grid-cols-2"
    >
      <input name="shippingMethodId" type="hidden" value={method.id} />
      <div className="sm:col-span-2">
        <h3 className="font-bold text-slate-950">{method.name}</h3>
        <p className="mt-1 text-sm text-slate-500">
          {formatCurrency(method.priceInCop)} · {method.code}
        </p>
      </div>
      <ShippingMethodFields method={method} />
      <button
        className="rounded-lg bg-slate-950 px-4 py-3 text-sm font-bold text-white disabled:bg-slate-400 sm:col-span-2"
        disabled={pending}
        type="submit"
      >
        {pending ? "Guardando…" : "Guardar método"}
      </button>
      {(state.error || state.success) && (
        <p
          className={`text-sm sm:col-span-2 ${state.error ? "text-red-700" : "text-emerald-700"}`}
          role="status"
        >
          {state.error ?? state.success}
        </p>
      )}
    </form>
  );
}

function NewShippingMethodForm() {
  const [state, action, pending] = useActionState(
    createShippingMethodAction,
    initialState,
  );

  return (
    <details className="rounded-xl border border-dashed border-slate-300 bg-white p-5">
      <summary className="cursor-pointer font-bold text-slate-950">
        Agregar método de envío
      </summary>
      <form action={action} className="mt-5 grid gap-4 sm:grid-cols-2">
        <ShippingMethodFields />
        <button
          className="rounded-lg bg-cyan-700 px-4 py-3 text-sm font-bold text-white disabled:bg-slate-400 sm:col-span-2"
          disabled={pending}
          type="submit"
        >
          {pending ? "Creando…" : "Crear método"}
        </button>
        {(state.error || state.success) && (
          <p
            className={`text-sm sm:col-span-2 ${state.error ? "text-red-700" : "text-emerald-700"}`}
            role="status"
          >
            {state.error ?? state.success}
          </p>
        )}
      </form>
    </details>
  );
}

export function ShippingMethodsForm({
  methods,
}: {
  methods: ShippingMethod[];
}) {
  return (
    <section className="mt-12 max-w-3xl">
      <h2 className="text-2xl font-bold text-slate-950">Métodos de envío</h2>
      <p className="mt-2 text-sm text-slate-600">
        Define las opciones, precios y orden que verá el comprador durante el
        checkout. Desactiva una opción para ocultarla sin perder su historial.
      </p>
      <div className="mt-6 space-y-5">
        {methods.map((method) => (
          <ExistingShippingMethodForm key={method.id} method={method} />
        ))}
        <NewShippingMethodForm />
      </div>
    </section>
  );
}
