import type { Metadata } from "next";

import { StoreSettingsForm } from "@/components/admin/store-settings-form";
import { ShippingMethodsForm } from "@/components/admin/shipping-methods-form";
import { listAdminShippingMethods } from "@/db/queries/admin-shipping";
import { getPublicStoreSettings } from "@/db/queries/store-settings";
import { requireAdmin } from "@/features/admin/admin-access";

export const metadata: Metadata = { title: "Configuración | Administración" };
export const dynamic = "force-dynamic";

export default async function StoreSettingsPage() {
  await requireAdmin();
  const [settings, shippingMethods] = await Promise.all([
    getPublicStoreSettings(),
    listAdminShippingMethods(),
  ]);

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <p className="text-sm font-bold tracking-widest text-cyan-700 uppercase">
        Tienda
      </p>
      <h1 className="mt-2 text-3xl font-bold text-slate-950">
        Configuración básica
      </h1>
      <p className="mt-3 max-w-2xl text-slate-600">
        Administra los datos públicos de contacto. Los números de cuentas para
        pagos se configurarán en una sección separada.
      </p>
      <StoreSettingsForm settings={settings} />
      <ShippingMethodsForm methods={shippingMethods} />
    </main>
  );
}
