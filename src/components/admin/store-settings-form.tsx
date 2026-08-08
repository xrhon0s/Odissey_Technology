"use client";

import { useActionState } from "react";

import {
  type StoreSettingsActionState,
  updateStoreSettingsAction,
} from "@/app/admin/configuracion/actions";
import type { PublicStoreSettings } from "@/features/store/store-settings";

const initialState: StoreSettingsActionState = {};
const inputClass =
  "h-11 w-full min-w-0 rounded-xl border border-line bg-surface px-3 text-sm text-foreground outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/10";
const labelClass = "grid gap-1.5 text-sm font-semibold text-foreground";

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
      className="border-line bg-surface mt-8 grid max-w-3xl gap-5 rounded-2xl border p-5 sm:p-6"
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
        <span className="text-muted font-normal">
          También recibirá los avisos de nuevos pedidos cuando el correo
          automático esté configurado.
        </span>
      </label>

      <details className="border-line overflow-hidden rounded-xl border" open>
        <summary className="hover:bg-brand/5 cursor-pointer px-4 py-4 transition">
          <span className="font-display text-foreground font-extrabold">
            Métodos de pago
          </span>
          <span className="text-muted mt-1 block text-sm font-normal">
            Controla qué opciones aparecen en el checkout y sus datos públicos.
          </span>
        </summary>
        <div className="border-line grid gap-6 border-t p-4">
          <section className="grid gap-4">
            <label className="text-foreground flex items-center gap-2 text-sm font-semibold">
              <input
                name="nequiEnabled"
                type="checkbox"
                defaultChecked={settings.nequiEnabled}
              />
              Ofrecer pagos por Nequi
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className={labelClass}>
                Número Nequi
                <input
                  name="nequiNumber"
                  inputMode="numeric"
                  maxLength={20}
                  defaultValue={settings.nequiNumber ?? ""}
                  className={inputClass}
                />
              </label>
              <label className={labelClass}>
                Llave Bre-B de Nequi
                <input
                  name="nequiKey"
                  maxLength={80}
                  defaultValue={settings.nequiKey ?? ""}
                  className={inputClass}
                />
              </label>
            </div>
            <p className="text-muted text-xs">
              QR configurado: <strong>Nequi / Bre-B</strong>
            </p>
          </section>

          <section className="border-line grid gap-4 border-t pt-6">
            <label className="text-foreground flex items-center gap-2 text-sm font-semibold">
              <input
                name="bancolombiaEnabled"
                type="checkbox"
                defaultChecked={settings.bancolombiaEnabled}
              />
              Ofrecer transferencias Bancolombia
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className={labelClass}>
                Cuenta de ahorros
                <input
                  name="bancolombiaAccountNumber"
                  inputMode="numeric"
                  maxLength={30}
                  defaultValue={settings.bancolombiaAccountNumber ?? ""}
                  className={inputClass}
                />
              </label>
              <label className={labelClass}>
                Llave Bre-B de Bancolombia
                <input
                  name="bancolombiaKey"
                  maxLength={80}
                  defaultValue={settings.bancolombiaKey ?? ""}
                  className={inputClass}
                />
              </label>
            </div>
            <p className="text-muted text-xs">
              QR configurado: <strong>Bancolombia / Bre-B</strong>
            </p>
          </section>

          <section className="border-line grid gap-3 border-t pt-6">
            <label className="text-foreground flex items-center gap-2 text-sm font-semibold">
              <input
                name="cashOnDeliveryEnabled"
                type="checkbox"
                defaultChecked={settings.cashOnDeliveryEnabled}
              />
              Ofrecer efectivo contraentrega en el Valle de Aburrá
            </label>
            <p className="text-muted text-xs">
              DaviPlata permanece oculto hasta completar su configuración.
            </p>
          </section>
        </div>
      </details>

      <div className="border-line border-t pt-5">
        <h2 className="font-display text-foreground font-extrabold">
          Información opcional del negocio
        </h2>
        <p className="text-muted mt-1 text-sm">
          Puedes completar estos datos cuando los tengas. Dejarlos vacíos no
          impide operar la tienda.
        </p>
      </div>
      <label className={labelClass}>
        Nombre o razón social
        <input
          name="legalName"
          maxLength={160}
          defaultValue={settings.legalName ?? ""}
          className={inputClass}
        />
      </label>
      <label className={labelClass}>
        NIT o documento de identificación
        <input
          name="taxId"
          maxLength={30}
          defaultValue={settings.taxId ?? ""}
          className={inputClass}
        />
      </label>
      <label className={labelClass}>
        Dirección de notificación
        <input
          name="notificationAddress"
          maxLength={240}
          defaultValue={settings.notificationAddress ?? ""}
          className={inputClass}
        />
      </label>
      <label className={labelClass}>
        Ciudad y país
        <input
          name="businessCity"
          maxLength={120}
          defaultValue={settings.businessCity ?? ""}
          placeholder="Medellín, Antioquia, Colombia"
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
        <span className="text-muted font-normal">
          Incluye el código de país. Para Colombia comienza con 57. Al
          habilitarlo, los clientes podrán enviar el comprobante desde su
          pedido.
        </span>
      </label>
      <label className="text-foreground flex items-center gap-2 text-sm font-semibold">
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
        className="bg-foreground hover:bg-brand-dark rounded-xl px-4 py-3 text-sm font-extrabold text-white transition disabled:bg-slate-400"
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
