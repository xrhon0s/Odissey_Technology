"use client";

import { useActionState, useState } from "react";

import {
  customerLoginAction,
  customerRegistrationAction,
  type CustomerAuthState,
} from "@/app/(store)/cuenta/acceder/actions";
import {
  CUSTOMER_PASSWORD_MIN_LENGTH,
  getCustomerPasswordChecks,
  type CustomerPasswordChecks,
} from "@/features/customers/customer-password";

const initialState: CustomerAuthState = {};
const initialRegistrationFields = {
  email: "",
  fullName: "",
  password: "",
  passwordConfirmation: "",
  phone: "",
};
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

function PasswordRequirement({
  children,
  complete,
}: {
  children: React.ReactNode;
  complete: boolean;
}) {
  return (
    <li
      className={
        complete
          ? "flex items-center gap-2 font-semibold text-emerald-700"
          : "text-muted flex items-center gap-2"
      }
    >
      <span
        aria-hidden="true"
        className={
          complete
            ? "flex size-5 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-xs text-white"
            : "border-line flex size-5 shrink-0 items-center justify-center rounded-full border bg-white text-transparent"
        }
      >
        ✓
      </span>
      {children}
      <span className="sr-only">{complete ? " Cumplido." : " Pendiente."}</span>
    </li>
  );
}

function allPasswordChecksPass(checks: CustomerPasswordChecks) {
  return Object.values(checks).every(Boolean);
}

export function CustomerAuthForms({ nextPath }: { nextPath: string }) {
  const [loginState, loginAction, loginPending] = useActionState(
    customerLoginAction,
    initialState,
  );
  const [registrationState, registrationAction, registrationPending] =
    useActionState(customerRegistrationAction, initialState);
  const [registrationFields, setRegistrationFields] = useState(
    initialRegistrationFields,
  );
  const passwordChecks = getCustomerPasswordChecks(
    registrationFields.password,
    registrationFields.passwordConfirmation,
  );
  const passwordIsValid = allPasswordChecksPass(passwordChecks);

  function updateRegistrationField(
    field: keyof typeof initialRegistrationFields,
    value: string,
  ) {
    setRegistrationFields((current) => ({ ...current, [field]: value }));
  }

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
          <input name="next" type="hidden" value={nextPath} />
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
          <p className="text-muted text-center text-xs leading-5">
            La recuperación automática estará disponible cuando definamos el
            servicio de correo.
          </p>
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
          <input name="next" type="hidden" value={nextPath} />
          <label className="text-foreground grid gap-1.5 text-sm font-semibold">
            Nombre completo
            <input
              autoComplete="name"
              className={inputClass}
              maxLength={120}
              name="fullName"
              onChange={(event) =>
                updateRegistrationField("fullName", event.target.value)
              }
              required
              value={registrationFields.fullName}
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
              onChange={(event) =>
                updateRegistrationField("phone", event.target.value)
              }
              placeholder="3001234567"
              required
              value={registrationFields.phone}
            />
          </label>
          <label className="text-foreground grid gap-1.5 text-sm font-semibold">
            Correo electrónico
            <input
              autoComplete="email"
              className={inputClass}
              maxLength={254}
              name="email"
              onChange={(event) =>
                updateRegistrationField("email", event.target.value)
              }
              required
              type="email"
              value={registrationFields.email}
            />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-foreground grid gap-1.5 text-sm font-semibold">
              Contraseña
              <input
                autoComplete="new-password"
                className={inputClass}
                maxLength={200}
                minLength={CUSTOMER_PASSWORD_MIN_LENGTH}
                name="password"
                onChange={(event) =>
                  updateRegistrationField("password", event.target.value)
                }
                required
                type="password"
                value={registrationFields.password}
              />
            </label>
            <label className="text-foreground grid gap-1.5 text-sm font-semibold">
              Repetir contraseña
              <input
                autoComplete="new-password"
                className={inputClass}
                maxLength={200}
                minLength={CUSTOMER_PASSWORD_MIN_LENGTH}
                name="passwordConfirmation"
                onChange={(event) =>
                  updateRegistrationField(
                    "passwordConfirmation",
                    event.target.value,
                  )
                }
                required
                type="password"
                value={registrationFields.passwordConfirmation}
              />
            </label>
          </div>
          <div
            aria-label="Requisitos de la contraseña"
            className="border-brand/20 rounded-2xl border bg-white/65 p-4"
          >
            <p className="text-foreground text-sm font-semibold">
              Tu contraseña debe tener:
            </p>
            <ul
              aria-live="polite"
              className="mt-3 grid gap-2 text-xs sm:grid-cols-2"
            >
              <PasswordRequirement complete={passwordChecks.hasMinimumLength}>
                Mínimo {CUSTOMER_PASSWORD_MIN_LENGTH} caracteres
              </PasswordRequirement>
              <PasswordRequirement complete={passwordChecks.hasLetter}>
                Al menos una letra
              </PasswordRequirement>
              <PasswordRequirement complete={passwordChecks.hasNumber}>
                Al menos un número
              </PasswordRequirement>
              <PasswordRequirement complete={passwordChecks.passwordsMatch}>
                Ambas contraseñas coinciden
              </PasswordRequirement>
            </ul>
          </div>
          <Feedback state={registrationState} />
          <button
            className="bg-brand text-foreground hover:bg-brand-dark h-12 rounded-full px-5 text-sm font-bold transition hover:text-white disabled:cursor-wait disabled:bg-slate-400"
            disabled={registrationPending || !passwordIsValid}
            type="submit"
          >
            {registrationPending ? "Creando cuenta…" : "Crear cuenta"}
          </button>
        </form>
      </section>
    </div>
  );
}
