"use client";

import { useActionState } from "react";

import {
  updateCustomerPasswordAction,
  type PasswordActionState,
} from "@/app/(store)/cuenta/recuperar/actions";

const initialState: PasswordActionState = {};
const inputClass =
  "h-11 w-full rounded-xl border border-line bg-surface px-3 text-sm text-foreground outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/10";

function Feedback({ state }: { state: PasswordActionState }) {
  if (state.error) {
    return (
      <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-800">
        {state.error}
      </p>
    );
  }
  return state.success ? (
    <p
      role="status"
      className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800"
    >
      {state.success}
    </p>
  ) : null;
}

export function PasswordUpdateForm() {
  const [state, action, pending] = useActionState(
    updateCustomerPasswordAction,
    initialState,
  );

  return (
    <form action={action} className="mt-6 grid gap-4">
      <label className="text-foreground grid gap-1.5 text-sm font-semibold">
        Nueva contraseña
        <input
          autoComplete="new-password"
          className={inputClass}
          maxLength={200}
          minLength={8}
          name="password"
          required
          type="password"
        />
      </label>
      <label className="text-foreground grid gap-1.5 text-sm font-semibold">
        Repite la contraseña
        <input
          autoComplete="new-password"
          className={inputClass}
          maxLength={200}
          minLength={8}
          name="passwordConfirmation"
          required
          type="password"
        />
      </label>
      <Feedback state={state} />
      <button
        className="bg-foreground hover:bg-brand-dark h-12 rounded-full px-5 text-sm font-bold text-white transition disabled:bg-slate-400"
        disabled={pending}
        type="submit"
      >
        {pending ? "Actualizando…" : "Guardar contraseña"}
      </button>
    </form>
  );
}
