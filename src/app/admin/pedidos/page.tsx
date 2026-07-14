import type { Metadata } from "next";

import { OrderList } from "@/components/admin/order-list";
import { listAdminOrders } from "@/db/queries/admin-orders";
import { requireAdmin } from "@/features/admin/admin-access";

export const metadata: Metadata = { title: "Pedidos | Administración" };
export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  await requireAdmin();
  const orders = await listAdminOrders();

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <p className="text-sm font-bold tracking-widest text-cyan-700 uppercase">
        Operación
      </p>
      <h1 className="mt-2 text-3xl font-bold text-slate-950">Pedidos</h1>
      <p className="mt-3 mb-8 max-w-2xl text-slate-600">
        Revisa pagos manuales y procesa cada pedido sin mezclar el estado
        financiero con la entrega.
      </p>
      <OrderList orders={orders} />
    </main>
  );
}
