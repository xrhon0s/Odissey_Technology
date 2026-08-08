import type { Metadata } from "next";

import { OrderList } from "@/components/admin/order-list";
import { OrderFilters } from "@/components/admin/order-filters";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { listAdminOrders } from "@/db/queries/admin-orders";
import { requireAdmin } from "@/features/admin/admin-access";
import { adminOrderFiltersSchema } from "@/features/admin/admin-order-filters";

export const metadata: Metadata = { title: "Pedidos | Administración" };
export const dynamic = "force-dynamic";

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireAdmin();
  const rawFilters = await searchParams;
  const filters = adminOrderFiltersSchema.parse({
    orderStatus:
      typeof rawFilters.orderStatus === "string"
        ? rawFilters.orderStatus
        : undefined,
    paymentStatus:
      typeof rawFilters.paymentStatus === "string"
        ? rawFilters.paymentStatus
        : undefined,
    query: typeof rawFilters.query === "string" ? rawFilters.query : undefined,
  });
  const orders = await listAdminOrders(filters);

  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10"
    >
      <AdminPageHeader
        description="Confirma pagos, prepara pedidos y consulta cada venta desde un solo lugar."
        eyebrow="Operación"
        title="Pedidos"
      />
      <OrderFilters filters={filters} />
      <div className="mt-5">
        <OrderList orders={orders} />
      </div>
    </main>
  );
}
