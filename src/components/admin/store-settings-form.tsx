"use client";

import { useActionState } from "react";

import {
  type StoreSettingsActionState,
  updateStoreSettingsAction,
} from "@/app/admin/configuracion/actions";
import type { PublicStoreSettings } from "@/features/store/store-settings";

const initialState: StoreSettingsActionState = {};
const inputClass =
  "h-11 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-950";
const labelClass = "grid gap-1 text-sm font-semibold text-slate-700";

export function StoreSettingsForm({
  settings,
}: {
  settings: PublicStoreSettings;
}) {
  const [state, action, pending] = useActionState(
    updateStoreSettingsAction,
    initialState,
  );

  return (
    <form
      action={action}
      className="mt-8 grid max-w-3xl gap-5 rounded-xl border border-slate-200 bg-white p-5"
    >
      <label className={labelClass}>
        Nombre de la tienda
        <input
          name="storeName"
          required
          maxLength={120}
          defaultValue={settings.storeName}
          className={inputClass}
        />
      </label>
      <label className={labelClass}>
        Mensaje superior
        <input
          name="announcement"
          required
          minLength={3}
          maxLength={180}
          defaultValue={settings.announcement}
          className={inputClass}
        />
      </label>
      <label className={labelClass}>
        Correo de atención
        <input
          name="supportEmail"
          type="email"
          maxLength={254}
          defaultValue={settings.supportEmail ?? ""}
          placeholder="ventas@odisseytechnology.com"
          className={inputClass}
        />
      </label>
      <label className={labelClass}>
        Número de WhatsApp
        <input
          name="whatsappNumber"
          type="tel"
          maxLength={24}
          defaultValue={settings.whatsappNumber ?? ""}
          placeholder="573001234567"
          className={inputClass}
        />
        <span className="font-normal text-slate-500">
          Incluye el código de país. Para Colombia comienza con 57.
        </span>
      </label>
      <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
        <input
          name="whatsappEnabled"
          type="checkbox"
          defaultChecked={settings.whatsappEnabled}
        />
        Mostrar botón público de WhatsApp
      </label>
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-slate-950 px-4 py-3 text-sm font-bold text-white hover:bg-slate-800 disabled:bg-slate-400"
      >
        {pending ? "Guardando…" : "Guardar configuración"}
      </button>
      {(state.error || state.success) && (
        <p
          role="status"
          className={`text-sm ${state.error ? "text-red-700" : "text-emerald-700"}`}
        >
          {state.error ?? state.success}
        </p>
      )}
    </form>
  );
}
