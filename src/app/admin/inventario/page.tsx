import type { Metadata } from "next";

import { InventoryList } from "@/components/admin/inventory-list";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { listAdminInventory } from "@/db/queries/admin-inventory";
import { requireAdmin } from "@/features/admin/admin-access";

export const metadata: Metadata = { title: "Inventario | Administración" };
export const dynamic = "force-dynamic";

export default async function AdminInventoryPage() {
  await requireAdmin();
  const inventory = await listAdminInventory();

  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10"
    >
      <AdminPageHeader
        description="Controla las existencias disponibles y registra cada ajuste para mantener el catálogo al día."
        eyebrow="Catálogo"
        title="Inventario"
      />
      <div className="mt-7">
        <InventoryList items={inventory} />
      </div>
    </main>
  );
}
