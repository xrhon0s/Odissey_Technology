import type { Metadata } from "next";

import { OrderList } from "@/components/admin/order-list";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { listAdminOrders } from "@/db/queries/admin-orders";
import { requireAdmin } from "@/features/admin/admin-access";

export const metadata: Metadata = { title: "Pedidos | Administración" };
export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  await requireAdmin();
  const orders = await listAdminOrders();

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
      <AdminPageHeader
        description="Confirma pagos, prepara pedidos y consulta cada venta desde un solo lugar."
        eyebrow="Operación"
        title="Pedidos"
      />
      <div className="mt-7">
        <OrderList orders={orders} />
      </div>
    </main>
  );
}
