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

export function OrderList({ orders }: { orders: AdminOrder[] }) {
  if (orders.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center text-slate-600">
        Todavía no hay pedidos registrados.
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
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="font-mono text-sm font-bold text-cyan-800">
                  {order.reference}
                </p>
                <h2 className="mt-1 text-lg font-bold text-slate-950">
                  {order.customerName}
                </h2>
                <p className="text-sm text-slate-600">{order.customerEmail}</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-slate-950">
                  {formatCurrency(order.totalInCop)}
                </p>
                <p className="text-xs text-slate-500">
                  {order.createdAt.toLocaleString("es-CO")}
                </p>
              </div>
            </div>

            <dl className="mt-5 grid gap-3 border-y border-slate-100 py-4 text-sm sm:grid-cols-4">
              <div>
                <dt className="text-slate-500">Pedido</dt>
                <dd className="mt-1 font-semibold text-slate-900">
                  {orderStatusLabels[order.orderStatus] ?? order.orderStatus}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">Pago</dt>
                <dd className="mt-1 font-semibold text-slate-900">
                  {paymentStatusLabels[order.paymentStatus] ??
                    order.paymentStatus}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">Método</dt>
                <dd className="mt-1 font-semibold text-slate-900">
                  {paymentName}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">Artículos</dt>
                <dd className="mt-1 font-semibold text-slate-900">
                  {order.itemCount}
                </dd>
              </div>
            </dl>

            {(canProcessPending || canRecordCash) && (
              <div className="mt-5 flex flex-wrap gap-3">
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
          </article>
        );
      })}
    </div>
  );
}
