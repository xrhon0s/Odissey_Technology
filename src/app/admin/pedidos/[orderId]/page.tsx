import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";

import { AdvanceOrderButton } from "@/components/admin/advance-order-button";
import { OrderActionButton } from "@/components/admin/order-action-button";
import { getAdminOrderById } from "@/db/queries/admin-orders";
import { requireAdmin } from "@/features/admin/admin-access";
import { manualPaymentMethods } from "@/features/payments/payment-methods";
import { formatCurrency } from "@/lib/format-currency";

export const dynamic = "force-dynamic";

const statusLabels: Record<string, string> = {
  approved: "Aprobado",
  cancelled: "Cancelado",
  confirmed: "Confirmado",
  declined: "Rechazado",
  delivered: "Entregado",
  pending: "Pendiente",
  preparing: "Preparando",
  refunded: "Reembolsado",
  shipped: "Enviado",
  voided: "Anulado",
};

const advanceLabels: Record<string, string> = {
  confirmed: "Comenzar preparación",
  preparing: "Marcar como enviado",
  shipped: "Marcar como entregado",
};

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  await requireAdmin();
  const parsedOrderId = z.uuid().safeParse((await params).orderId);
  if (!parsedOrderId.success) notFound();

  const order = await getAdminOrderById(parsedOrderId.data);
  if (!order) notFound();

  const paymentName =
    manualPaymentMethods.find((method) => method.code === order.paymentMethod)
      ?.name ?? "Pago manual legado";
  const address = order.addressSnapshot;
  const isCash = order.paymentMethod === "cash_on_delivery";
  const canProcessPending =
    order.status === "pending" && order.paymentStatus === "pending";
  const canRecordCash =
    isCash &&
    order.paymentStatus === "pending" &&
    ["confirmed", "preparing", "shipped", "delivered"].includes(order.status);
  const advanceLabel = advanceLabels[order.status];

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <Link href="/admin" className="text-sm font-semibold text-cyan-800">
        ← Volver a pedidos
      </Link>
      <div className="mt-5 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="font-mono text-sm font-bold text-cyan-800">
            {order.reference}
          </p>
          <h1 className="mt-1 text-3xl font-bold text-slate-950">
            {order.customerName}
          </h1>
          <p className="mt-2 text-slate-600">
            {order.customerEmail} · {order.customerPhone}
          </p>
        </div>
        <p className="text-2xl font-bold text-slate-950">
          {formatCurrency(order.totalInCop)}
        </p>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <h2 className="text-lg font-bold text-slate-950">Productos</h2>
            <div className="mt-4 divide-y divide-slate-100">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between gap-4 py-4 text-sm"
                >
                  <div>
                    <p className="font-semibold text-slate-950">
                      {item.quantity} × {item.productName}
                    </p>
                    <p className="mt-1 text-slate-500">
                      {item.variantName} · {item.sku}
                    </p>
                  </div>
                  <p className="font-semibold text-slate-950">
                    {formatCurrency(item.lineTotalInCop)}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <h2 className="text-lg font-bold text-slate-950">Historial</h2>
            <ol className="mt-4 space-y-4 border-l-2 border-slate-200 pl-4">
              {order.orderHistory.map((event) => (
                <li key={event.id}>
                  <p className="text-sm font-semibold text-slate-950">
                    {statusLabels[event.toStatus] ?? event.toStatus}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {event.createdAt.toLocaleString("es-CO")}
                    {event.actorName ? ` · ${event.actorName}` : " · Sistema"}
                  </p>
                </li>
              ))}
            </ol>
          </section>
        </div>

        <aside className="space-y-6">
          <section className="rounded-2xl bg-slate-950 p-5 text-white">
            <h2 className="font-bold">Estado y acciones</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-slate-400">Pedido</dt>
                <dd>{statusLabels[order.status] ?? order.status}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-400">Pago</dt>
                <dd>
                  {statusLabels[order.paymentStatus] ?? order.paymentStatus}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-400">Método</dt>
                <dd className="text-right">{paymentName}</dd>
              </div>
            </dl>
            <div className="mt-5 flex flex-wrap gap-3 border-t border-slate-700 pt-5">
              {canProcessPending && !isCash && (
                <OrderActionButton
                  action="approve_transfer"
                  label="Aprobar transferencia"
                  paymentId={order.paymentId}
                  tone="primary"
                />
              )}
              {canProcessPending && isCash && (
                <OrderActionButton
                  action="confirm_cash_on_delivery"
                  label="Confirmar contraentrega"
                  paymentId={order.paymentId}
                  tone="primary"
                />
              )}
              {canRecordCash && (
                <OrderActionButton
                  action="record_cash_received"
                  label="Registrar efectivo"
                  paymentId={order.paymentId}
                  tone="primary"
                />
              )}
              {canProcessPending && (
                <OrderActionButton
                  action="decline_order"
                  label="Rechazar pedido"
                  paymentId={order.paymentId}
                  tone="danger"
                />
              )}
              {advanceLabel && (
                <AdvanceOrderButton label={advanceLabel} orderId={order.id} />
              )}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <h2 className="font-bold text-slate-950">Entrega</h2>
            <p className="mt-3 text-sm text-slate-700">
              {order.shippingMethodName}
            </p>
            {address ? (
              <address className="mt-3 text-sm leading-6 text-slate-600 not-italic">
                {address.addressLine1}
                {address.addressLine2 ? `, ${address.addressLine2}` : ""}
                <br />
                {address.neighborhood ? `${address.neighborhood}, ` : ""}
                {address.city}, {address.department}
              </address>
            ) : (
              <p className="mt-3 text-sm text-slate-600">
                Recogida coordinada con el cliente.
              </p>
            )}
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <h2 className="font-bold text-slate-950">Totales</h2>
            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <dt>Productos</dt>
                <dd>{formatCurrency(order.subtotalInCop)}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Envío</dt>
                <dd>{formatCurrency(order.shippingInCop)}</dd>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-2 font-bold">
                <dt>Total</dt>
                <dd>{formatCurrency(order.totalInCop)}</dd>
              </div>
            </dl>
          </section>
        </aside>
      </div>
    </main>
  );
}
