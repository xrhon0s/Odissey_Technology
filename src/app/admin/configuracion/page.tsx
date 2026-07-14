import type { Metadata } from "next";

import { StoreSettingsForm } from "@/components/admin/store-settings-form";
import { ShippingMethodsForm } from "@/components/admin/shipping-methods-form";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
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
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
      <AdminPageHeader
        description="Actualiza la información pública del negocio y las opciones de entrega disponibles en el checkout."
        eyebrow="Tienda"
        title="Configuración"
      />
      <StoreSettingsForm settings={settings} />
      <ShippingMethodsForm methods={shippingMethods} />
    </main>
  );
}
