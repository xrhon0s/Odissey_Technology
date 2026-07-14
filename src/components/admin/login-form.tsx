"use client";

import { useActionState } from "react";

import { loginAction, type LoginState } from "@/app/login/actions";

const initialState: LoginState = {};

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(
    loginAction,
    initialState,
  );

  return (
    <form action={formAction} className="mt-8 space-y-5">
      <label className="grid gap-2 text-sm font-semibold text-slate-700">
        Correo electrónico
        <input
          name="email"
          type="email"
          autoComplete="email"
          required
          className="h-11 rounded-xl border border-slate-300 px-3 text-slate-950"
        />
      </label>
      <label className="grid gap-2 text-sm font-semibold text-slate-700">
        Contraseña
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          minLength={8}
          required
          className="h-11 rounded-xl border border-slate-300 px-3 text-slate-950"
        />
      </label>
      {state.error && (
        <p
          role="alert"
          className="rounded-xl bg-red-50 p-3 text-sm text-red-800"
        >
          {state.error}
        </p>
      )}
      <button
        type="submit"
        disabled={isPending}
        className="h-12 w-full rounded-xl bg-slate-950 text-sm font-bold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
      >
        {isPending ? "Ingresando…" : "Ingresar al panel"}
      </button>
    </form>
  );
}
