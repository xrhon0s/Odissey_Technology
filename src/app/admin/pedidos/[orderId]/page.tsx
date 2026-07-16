import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";

import { AdvanceOrderButton } from "@/components/admin/advance-order-button";
import { OrderActionButton } from "@/components/admin/order-action-button";
import { ShipmentForm } from "@/components/admin/shipment-form";
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
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <Link
        href="/admin/pedidos"
        className="text-brand-dark text-sm font-extrabold hover:underline"
      >
        ← Volver a pedidos
      </Link>
      <div className="mt-5 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-brand-dark font-mono text-sm font-bold">
            {order.reference}
          </p>
          <h1 className="font-display text-foreground mt-1 text-3xl font-extrabold sm:text-4xl">
            {order.customerName}
          </h1>
          <p className="text-muted mt-2">
            {order.customerEmail} · {order.customerPhone}
          </p>
        </div>
        <p className="font-display text-foreground text-2xl font-extrabold">
          {formatCurrency(order.totalInCop)}
        </p>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <section className="border-line bg-surface rounded-2xl border p-5">
            <h2 className="font-display text-foreground text-lg font-extrabold">
              Productos
            </h2>
            <div className="divide-line mt-4 divide-y">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between gap-4 py-4 text-sm"
                >
                  <div>
                    <p className="text-foreground font-semibold">
                      {item.quantity} × {item.productName}
                    </p>
                    <p className="text-muted mt-1">
                      {item.variantName} · {item.sku}
                    </p>
                  </div>
                  <p className="text-foreground font-semibold">
                    {formatCurrency(item.lineTotalInCop)}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="border-line bg-surface rounded-2xl border p-5">
            <h2 className="font-display text-foreground text-lg font-extrabold">
              Historial
            </h2>
            <ol className="border-brand/30 mt-4 space-y-4 border-l-2 pl-4">
              {order.orderHistory.map((event) => (
                <li key={event.id}>
                  <p className="text-foreground text-sm font-semibold">
                    {statusLabels[event.toStatus] ?? event.toStatus}
                  </p>
                  <p className="text-muted mt-1 text-xs">
                    {event.createdAt.toLocaleString("es-CO")}
                    {event.actorName ? ` · ${event.actorName}` : " · Sistema"}
                  </p>
                  {event.notes ? (
                    <p className="text-muted mt-1 text-xs">{event.notes}</p>
                  ) : null}
                </li>
              ))}
            </ol>
          </section>
        </div>

        <aside className="space-y-6">
          <section className="bg-brand-navy rounded-2xl p-5 text-white">
            <h2 className="font-display font-extrabold">Estado y acciones</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-white/55">Pedido</dt>
                <dd>{statusLabels[order.status] ?? order.status}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-white/55">Pago</dt>
                <dd>
                  {statusLabels[order.paymentStatus] ?? order.paymentStatus}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-white/55">Método</dt>
                <dd className="text-right">{paymentName}</dd>
              </div>
            </dl>
            <div className="mt-5 flex flex-wrap gap-3 border-t border-white/15 pt-5">
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
              {advanceLabel && order.status !== "preparing" && (
                <AdvanceOrderButton label={advanceLabel} orderId={order.id} />
              )}
            </div>
            {order.status === "preparing" ? (
              <ShipmentForm orderId={order.id} />
            ) : null}
          </section>

          <section className="border-line bg-surface rounded-2xl border p-5">
            <h2 className="font-display text-foreground font-extrabold">
              Entrega
            </h2>
            <p className="text-foreground mt-3 text-sm">
              {order.shippingMethodName}
            </p>
            {address ? (
              <address className="text-muted mt-3 text-sm leading-6 not-italic">
                {address.addressLine1}
                {address.addressLine2 ? `, ${address.addressLine2}` : ""}
                <br />
                {address.neighborhood ? `${address.neighborhood}, ` : ""}
                {address.city}, {address.department}
              </address>
            ) : (
              <p className="text-muted mt-3 text-sm">
                Recogida coordinada con el cliente.
              </p>
            )}
            {order.shippingCarrier ? (
              <dl className="border-line mt-4 space-y-2 border-t pt-4 text-sm">
                <div>
                  <dt className="text-muted text-xs">Transportadora</dt>
                  <dd className="text-foreground font-semibold">
                    {order.shippingCarrier}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted text-xs">Número de guía</dt>
                  <dd className="text-foreground font-mono font-semibold break-all">
                    {order.trackingNumber}
                  </dd>
                </div>
                {order.trackingUrl ? (
                  <a
                    className="text-brand-dark inline-flex font-bold hover:underline"
                    href={order.trackingUrl}
                    rel="noreferrer"
                    target="_blank"
                  >
                    Abrir rastreo →
                  </a>
                ) : null}
              </dl>
            ) : null}
          </section>

          <section className="border-line bg-surface rounded-2xl border p-5">
            <h2 className="font-display text-foreground font-extrabold">
              Totales
            </h2>
            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <dt>Productos</dt>
                <dd>{formatCurrency(order.subtotalInCop)}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Envío</dt>
                <dd>{formatCurrency(order.shippingInCop)}</dd>
              </div>
              <div className="border-line flex justify-between border-t pt-2 font-bold">
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
