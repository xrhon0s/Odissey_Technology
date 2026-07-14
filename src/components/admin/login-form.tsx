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
      <label className="text-foreground grid gap-2 text-sm font-semibold">
        Correo electrónico
        <input
          name="email"
          type="email"
          autoComplete="email"
          required
          className="border-line text-foreground focus:border-brand h-11 rounded-xl border px-3 outline-none"
        />
      </label>
      <label className="text-foreground grid gap-2 text-sm font-semibold">
        Contraseña
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          minLength={8}
          required
          className="border-line text-foreground focus:border-brand h-11 rounded-xl border px-3 outline-none"
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
        className="bg-foreground hover:bg-brand-dark h-12 w-full rounded-xl text-sm font-extrabold text-white transition disabled:cursor-not-allowed disabled:bg-slate-400"
      >
        {isPending ? "Ingresando…" : "Ingresar al panel"}
      </button>
    </form>
  );
}
