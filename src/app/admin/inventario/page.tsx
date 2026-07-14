import type { Metadata } from "next";

import { InventoryList } from "@/components/admin/inventory-list";
import { listAdminInventory } from "@/db/queries/admin-inventory";
import { requireAdmin } from "@/features/admin/admin-access";

export const metadata: Metadata = { title: "Inventario | Administración" };
export const dynamic = "force-dynamic";

export default async function AdminInventoryPage() {
  await requireAdmin();
  const inventory = await listAdminInventory();

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <p className="text-sm font-bold tracking-widest text-cyan-700 uppercase">
        Catálogo
      </p>
      <h1 className="mt-2 text-3xl font-bold text-slate-950">Inventario</h1>
      <p className="mt-3 mb-8 max-w-2xl text-slate-600">
        Consulta existencias por variante y registra ajustes con su motivo. Las
        unidades reservadas por pedidos no pueden eliminarse.
      </p>
      <InventoryList items={inventory} />
    </main>
  );
}
