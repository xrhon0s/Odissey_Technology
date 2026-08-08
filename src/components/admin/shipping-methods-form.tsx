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
  "h-11 rounded-xl border border-line bg-surface px-3 text-sm text-foreground outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/10";
const labelClass = "grid gap-1.5 text-sm font-semibold text-foreground";

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
      <label className="text-foreground flex items-center gap-2 text-sm font-semibold">
        <input
          defaultChecked={method?.requiresAddress ?? true}
          name="requiresAddress"
          type="checkbox"
        />
        Solicitar dirección
      </label>
      <label className="text-foreground flex items-center gap-2 text-sm font-semibold">
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
      className="border-line bg-surface grid gap-4 rounded-2xl border p-5 sm:grid-cols-2"
    >
      <input name="shippingMethodId" type="hidden" value={method.id} />
      <div className="sm:col-span-2">
        <h3 className="font-display text-foreground font-extrabold">
          {method.name}
        </h3>
        <p className="text-muted mt-1 text-sm">
          {formatCurrency(method.priceInCop)} · {method.code}
        </p>
      </div>
      <ShippingMethodFields method={method} />
      <button
        className="bg-foreground hover:bg-brand-dark rounded-xl px-4 py-3 text-sm font-extrabold text-white transition disabled:bg-slate-400 sm:col-span-2"
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
    <details className="border-line bg-surface rounded-2xl border border-dashed p-5">
      <summary className="font-display text-foreground cursor-pointer font-extrabold">
        Agregar método de envío
      </summary>
      <form action={action} className="mt-5 grid gap-4 sm:grid-cols-2">
        <ShippingMethodFields />
        <button
          className="bg-foreground hover:bg-brand-dark rounded-xl px-4 py-3 text-sm font-extrabold text-white transition disabled:bg-slate-400 sm:col-span-2"
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
    <section className="border-line mt-12 max-w-3xl border-t pt-10">
      <h2 className="font-display text-foreground text-2xl font-extrabold">
        Métodos de envío
      </h2>
      <p className="text-muted mt-2 text-sm leading-6">
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
