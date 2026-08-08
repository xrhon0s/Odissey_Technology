import type { Metadata } from "next";

import Link from "next/link";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { getAdminDashboardMetrics } from "@/db/queries/admin-dashboard";
import { requireAdmin } from "@/features/admin/admin-access";
import { formatCurrency } from "@/lib/format-currency";

export const metadata: Metadata = { title: "Resumen | Administración" };
export const dynamic = "force-dynamic";

export default async function AdminPage() {
  await requireAdmin();
  const metrics = await getAdminDashboardMetrics();
  const cards = [
    {
      detail: "Pedidos que requieren revisión",
      href: "/admin/pedidos",
      label: "Pedidos pendientes",
      tone: "bg-brand/10 text-brand-dark",
      value: metrics.pendingOrders,
    },
    {
      detail: "Transferencias por confirmar",
      href: "/admin/pedidos",
      label: "Pagos pendientes",
      tone: "bg-brand-yellow/25 text-amber-900",
      value: metrics.pendingPayments,
    },
    {
      detail: "Variantes con pocas unidades",
      href: "/admin/inventario",
      label: "Alertas de inventario",
      tone: "bg-brand-red/10 text-brand-red",
      value: metrics.lowStockVariants,
    },
    {
      detail: "Publicados en el catálogo",
      href: "/admin/productos",
      label: "Productos activos",
      tone: "bg-emerald-100 text-emerald-800",
      value: metrics.activeProducts,
    },
  ];

  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10"
    >
      <AdminPageHeader
        description="Revisa lo importante del negocio y entra directamente a las tareas que requieren atención."
        eyebrow="Panel de control"
        title="Resumen de hoy"
      />

      <section className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="group border-line bg-surface hover:border-brand/50 rounded-2xl border p-5 transition hover:-translate-y-0.5 hover:shadow-lg"
          >
            <div className="flex items-start justify-between gap-3">
              <p className="text-muted text-sm font-semibold">{card.label}</p>
              <span
                className={`rounded-full px-2 py-1 text-xs font-bold ${card.tone}`}
              >
                Ver
              </span>
            </div>
            <p className="font-display text-foreground mt-4 text-4xl font-extrabold">
              {card.value}
            </p>
            <p className="text-muted mt-2 text-xs leading-5">{card.detail}</p>
          </Link>
        ))}
      </section>

      <section className="mt-6 grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <article className="bg-brand-navy overflow-hidden rounded-2xl p-6 text-white sm:p-7">
          <p className="text-sm font-semibold text-white/65">
            Ingresos aprobados
          </p>
          <p className="font-display mt-2 text-3xl font-extrabold sm:text-4xl">
            {formatCurrency(metrics.approvedRevenueInCop)}
          </p>
          <p className="mt-3 max-w-md text-sm leading-6 text-white/65">
            Total registrado en pedidos con pago confirmado.
          </p>
        </article>

        <article className="border-line bg-surface rounded-2xl border p-6">
          <h2 className="font-display text-foreground text-lg font-extrabold">
            Acciones rápidas
          </h2>
          <div className="mt-4 grid gap-2">
            <Link
              className="bg-canvas text-foreground hover:bg-brand/10 rounded-xl px-4 py-3 text-sm font-bold transition"
              href="/admin/productos#nuevo-producto"
            >
              + Crear un producto
            </Link>
            <Link
              className="bg-canvas text-foreground hover:bg-brand/10 rounded-xl px-4 py-3 text-sm font-bold transition"
              href="/admin/inventario"
            >
              Ajustar inventario
            </Link>
            <Link
              className="bg-canvas text-foreground hover:bg-brand/10 rounded-xl px-4 py-3 text-sm font-bold transition"
              href="/admin/configuracion"
            >
              Configurar tienda y envíos
            </Link>
          </div>
        </article>
      </section>
    </main>
  );
}
