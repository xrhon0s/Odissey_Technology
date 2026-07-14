import type { Metadata } from "next";

import Link from "next/link";

import { getAdminDashboardMetrics } from "@/db/queries/admin-dashboard";
import { requireAdmin } from "@/features/admin/admin-access";
import { formatCurrency } from "@/lib/format-currency";

export const metadata: Metadata = { title: "Resumen | Administración" };
export const dynamic = "force-dynamic";

export default async function AdminPage() {
  await requireAdmin();
  const metrics = await getAdminDashboardMetrics();
  const cards = [
    { label: "Pedidos pendientes", value: metrics.pendingOrders },
    { label: "Pagos pendientes", value: metrics.pendingPayments },
    { label: "Alertas de inventario", value: metrics.lowStockVariants },
    { label: "Productos activos", value: metrics.activeProducts },
  ];

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <p className="text-sm font-bold tracking-widest text-cyan-700 uppercase">
        Dashboard
      </p>
      <h1 className="mt-2 text-3xl font-bold text-slate-950">
        Resumen operativo
      </h1>
      <p className="mt-3 mb-8 max-w-2xl text-slate-600">
        Estado actual de ventas, pedidos e inventario.
      </p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <article
            key={card.label}
            className="rounded-2xl bg-white p-5 shadow-sm"
          >
            <p className="text-sm text-slate-600">{card.label}</p>
            <p className="mt-2 text-3xl font-bold text-slate-950">
              {card.value}
            </p>
          </article>
        ))}
      </div>
      <article className="mt-6 rounded-2xl bg-slate-950 p-6 text-white">
        <p className="text-sm text-slate-300">Ingresos aprobados</p>
        <p className="mt-2 text-3xl font-bold">
          {formatCurrency(metrics.approvedRevenueInCop)}
        </p>
      </article>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <Link
          href="/admin/pedidos"
          className="rounded-2xl border border-slate-200 bg-white p-5 font-bold text-slate-950 shadow-sm hover:border-cyan-500"
        >
          Gestionar pedidos →
        </Link>
        <Link
          href="/admin/inventario"
          className="rounded-2xl border border-slate-200 bg-white p-5 font-bold text-slate-950 shadow-sm hover:border-cyan-500"
        >
          Revisar inventario →
        </Link>
      </div>
    </main>
  );
}
