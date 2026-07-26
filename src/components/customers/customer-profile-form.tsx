"use client";

import { useActionState } from "react";

import {
  updateCustomerProfileAction,
  type CustomerProfileState,
} from "@/app/(store)/cuenta/actions";

const initialState: CustomerProfileState = {};
const inputClass =
  "h-11 w-full rounded-xl border border-line bg-surface px-3 text-sm text-foreground outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/10";

export function CustomerProfileForm({
  fullName,
  phone,
}: {
  fullName: string;
  phone: string | null;
}) {
  const [state, formAction, pending] = useActionState(
    updateCustomerProfileAction,
    initialState,
  );

  return (
    <form action={formAction} className="mt-5 grid gap-4">
      <label className="text-foreground grid gap-1.5 text-sm font-semibold">
        Nombre completo
        <input
          autoComplete="name"
          className={inputClass}
          defaultValue={fullName}
          maxLength={120}
          name="fullName"
          required
        />
      </label>
      <label className="text-foreground grid gap-1.5 text-sm font-semibold">
        Celular
        <input
          autoComplete="tel"
          className={inputClass}
          defaultValue={phone ?? ""}
          inputMode="tel"
          maxLength={20}
          name="phone"
          required
        />
      </label>
      {state.error ? (
        <p role="alert" className="text-sm text-red-700">
          {state.error}
        </p>
      ) : null}
      {state.success ? (
        <p role="status" className="text-sm text-emerald-700">
          {state.success}
        </p>
      ) : null}
      <button
        className="bg-foreground hover:bg-brand-dark h-11 rounded-full px-4 text-sm font-bold text-white transition disabled:bg-slate-400"
        disabled={pending}
        type="submit"
      >
        {pending ? "Guardando…" : "Guardar datos"}
      </button>
    </form>
  );
}
