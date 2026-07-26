"use client";

import Link from "next/link";
import { useActionState } from "react";

import {
  customerLoginAction,
  customerRegistrationAction,
  type CustomerAuthState,
} from "@/app/(store)/cuenta/acceder/actions";

const initialState: CustomerAuthState = {};
const inputClass =
  "h-11 w-full rounded-xl border border-line bg-surface px-3 text-sm text-foreground outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/10";

function Feedback({ state }: { state: CustomerAuthState }) {
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

export function CustomerAuthForms() {
  const [loginState, loginAction, loginPending] = useActionState(
    customerLoginAction,
    initialState,
  );
  const [registrationState, registrationAction, registrationPending] =
    useActionState(customerRegistrationAction, initialState);

  return (
    <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
      <section className="border-line bg-surface rounded-[1.75rem] border p-5 shadow-sm sm:p-7">
        <p className="text-brand-dark text-xs font-bold tracking-[0.16em] uppercase">
          Ya tengo cuenta
        </p>
        <h2 className="font-display text-foreground mt-2 text-2xl font-bold">
          Inicia sesión
        </h2>
        <p className="text-muted mt-2 text-sm leading-6">
          Consulta tus compras vinculadas y mantén tus datos listos para el
          checkout.
        </p>
        <form action={loginAction} className="mt-6 grid gap-4">
          <label className="text-foreground grid gap-1.5 text-sm font-semibold">
            Correo electrónico
            <input
              autoComplete="email"
              className={inputClass}
              maxLength={254}
              name="email"
              required
              type="email"
            />
          </label>
          <label className="text-foreground grid gap-1.5 text-sm font-semibold">
            Contraseña
            <input
              autoComplete="current-password"
              className={inputClass}
              maxLength={200}
              minLength={8}
              name="password"
              required
              type="password"
            />
          </label>
          <Feedback state={loginState} />
          <button
            className="bg-foreground hover:bg-brand-dark h-12 rounded-full px-5 text-sm font-bold text-white transition disabled:cursor-wait disabled:bg-slate-400"
            disabled={loginPending}
            type="submit"
          >
            {loginPending ? "Ingresando…" : "Ingresar"}
          </button>
          <Link
            className="text-brand-dark text-center text-sm font-semibold underline-offset-4 hover:underline"
            href="/cuenta/recuperar"
          >
            Olvidé mi contraseña
          </Link>
        </form>
      </section>

      <section className="border-brand/25 bg-brand-soft rounded-[1.75rem] border p-5 sm:p-7">
        <p className="text-brand-dark text-xs font-bold tracking-[0.16em] uppercase">
          Primera compra
        </p>
        <h2 className="font-display text-foreground mt-2 text-2xl font-bold">
          Crea tu cuenta
        </h2>
        <p className="text-muted mt-2 text-sm leading-6">
          Es opcional: siempre podrás comprar como invitado.
        </p>
        <form action={registrationAction} className="mt-6 grid gap-4">
          <label className="text-foreground grid gap-1.5 text-sm font-semibold">
            Nombre completo
            <input
              autoComplete="name"
              className={inputClass}
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
              inputMode="tel"
              maxLength={20}
              name="phone"
              placeholder="3001234567"
              required
            />
          </label>
          <label className="text-foreground grid gap-1.5 text-sm font-semibold">
            Correo electrónico
            <input
              autoComplete="email"
              className={inputClass}
              maxLength={254}
              name="email"
              required
              type="email"
            />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-foreground grid gap-1.5 text-sm font-semibold">
              Contraseña
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
              Repetir contraseña
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
          </div>
          <p className="text-muted text-xs">
            Usa mínimo 8 caracteres, con al menos una letra y un número.
          </p>
          <Feedback state={registrationState} />
          <button
            className="bg-brand text-foreground hover:bg-brand-dark h-12 rounded-full px-5 text-sm font-bold transition hover:text-white disabled:cursor-wait disabled:bg-slate-400"
            disabled={registrationPending}
            type="submit"
          >
            {registrationPending ? "Creando cuenta…" : "Crear cuenta"}
          </button>
        </form>
      </section>
    </div>
  );
}
