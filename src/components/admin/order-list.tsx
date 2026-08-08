import Link from "next/link";

import { OrderActionButton } from "./order-action-button";

import { formatCurrency } from "@/lib/format-currency";
import { manualPaymentMethods } from "@/features/payments/payment-methods";

type AdminOrder = {
  createdAt: Date;
  customerEmail: string;
  customerName: string;
  itemCount: number;
  orderId: string;
  orderStatus: string;
  paymentId: string;
  paymentMethod: string;
  paymentStatus: string;
  reference: string;
  reservationExpiresAt: Date;
  totalInCop: number;
};

const orderStatusLabels: Record<string, string> = {
  cancelled: "Cancelado",
  confirmed: "Confirmado",
  delivered: "Entregado",
  pending: "Pendiente",
  preparing: "Preparando",
  shipped: "Enviado",
};

const paymentStatusLabels: Record<string, string> = {
  approved: "Aprobado",
  declined: "Rechazado",
  pending: "Pendiente",
  refunded: "Reembolsado",
  voided: "Anulado",
};

const statusTone: Record<string, string> = {
  approved: "bg-emerald-100 text-emerald-800",
  cancelled: "bg-slate-200 text-slate-700",
  confirmed: "bg-brand/10 text-brand-dark",
  declined: "bg-red-100 text-red-800",
  delivered: "bg-emerald-100 text-emerald-800",
  pending: "bg-brand-yellow/25 text-amber-900",
  preparing: "bg-blue-100 text-blue-800",
  refunded: "bg-violet-100 text-violet-800",
  shipped: "bg-cyan-100 text-cyan-800",
  voided: "bg-slate-200 text-slate-700",
};

export function OrderList({ orders }: { orders: AdminOrder[] }) {
  if (orders.length === 0) {
    return (
      <div className="border-line bg-surface rounded-2xl border border-dashed px-6 py-16 text-center">
        <p className="font-display text-foreground text-lg font-extrabold">
          Todavía no hay pedidos
        </p>
        <p className="text-muted mt-2 text-sm">
          Las nuevas compras aparecerán aquí para que puedas procesarlas.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => {
        const paymentName =
          manualPaymentMethods.find(
            (method) => method.code === order.paymentMethod,
          )?.name ?? "Pago manual legado";
        const isCash = order.paymentMethod === "cash_on_delivery";
        const canProcessPending =
          order.orderStatus === "pending" && order.paymentStatus === "pending";
        const canRecordCash =
          isCash &&
          order.paymentStatus === "pending" &&
          ["confirmed", "preparing", "shipped", "delivered"].includes(
            order.orderStatus,
          );

        return (
          <article
            key={order.orderId}
            className="border-line bg-surface rounded-2xl border p-5 shadow-sm sm:p-6"
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-brand-dark font-mono text-sm font-bold">
                  <Link
                    href={`/admin/pedidos/${order.orderId}`}
                    className="hover:underline"
                  >
                    {order.reference}
                  </Link>
                </p>
                <h2 className="font-display text-foreground mt-1 text-lg font-extrabold">
                  {order.customerName}
                </h2>
                <p className="text-muted text-sm">{order.customerEmail}</p>
              </div>
              <div className="text-right">
                <p className="font-display text-foreground text-lg font-extrabold">
                  {formatCurrency(order.totalInCop)}
                </p>
                <p className="text-muted text-xs">
                  {order.createdAt.toLocaleString("es-CO")}
                </p>
              </div>
            </div>

            <dl className="bg-canvas mt-5 grid gap-4 rounded-xl p-4 text-sm sm:grid-cols-4">
              <div>
                <dt className="text-muted text-xs">Estado del pedido</dt>
                <dd
                  className={`mt-2 w-fit rounded-full px-2.5 py-1 text-xs font-bold ${statusTone[order.orderStatus] ?? "bg-slate-100 text-slate-700"}`}
                >
                  {orderStatusLabels[order.orderStatus] ?? order.orderStatus}
                </dd>
              </div>
              <div>
                <dt className="text-muted text-xs">Estado del pago</dt>
                <dd
                  className={`mt-2 w-fit rounded-full px-2.5 py-1 text-xs font-bold ${statusTone[order.paymentStatus] ?? "bg-slate-100 text-slate-700"}`}
                >
                  {paymentStatusLabels[order.paymentStatus] ??
                    order.paymentStatus}
                </dd>
              </div>
              <div>
                <dt className="text-muted text-xs">Método de pago</dt>
                <dd className="text-foreground mt-2 font-semibold">
                  {paymentName}
                </dd>
              </div>
              <div>
                <dt className="text-muted text-xs">Artículos</dt>
                <dd className="text-foreground mt-2 font-semibold">
                  {order.itemCount}
                </dd>
              </div>
            </dl>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
              <Link
                href={`/admin/pedidos/${order.orderId}`}
                className="text-brand-dark text-sm font-extrabold hover:underline"
              >
                Ver pedido completo →
              </Link>
              {(canProcessPending || canRecordCash) && (
                <div className="flex flex-wrap gap-3">
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
                </div>
              )}
            </div>
          </article>
        );
      })}
    </div>
  );
}
