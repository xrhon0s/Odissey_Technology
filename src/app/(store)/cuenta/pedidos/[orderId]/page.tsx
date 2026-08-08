import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { PaymentInstructions } from "@/components/payments/payment-instructions";
import { getCustomerOrderById } from "@/db/queries/customer-orders";
import { getPublicStoreSettings } from "@/db/queries/store-settings";
import { requireCustomer } from "@/features/customers/customer-access";
import {
  buildPaymentInstructions,
  manualPaymentMethods,
  manualPaymentMethodSchema,
} from "@/features/payments/payment-methods";
import { buildPaymentProofWhatsAppUrl } from "@/features/store/store-settings";
import { formatCurrency } from "@/lib/format-currency";

export const metadata: Metadata = { title: "Detalle del pedido" };
export const dynamic = "force-dynamic";

const statusLabels: Record<string, string> = {
  approved: "Aprobado",
  cancelled: "Cancelado",
  confirmed: "Confirmado",
  delivered: "Entregado",
  pending: "Pendiente",
  preparing: "En preparación",
  refunded: "Reembolsado",
  shipped: "Enviado",
  voided: "Anulado",
};

export default async function CustomerOrderPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const [customer, { orderId }] = await Promise.all([
    requireCustomer(),
    params,
  ]);
  const order = await getCustomerOrderById(customer.id, orderId);
  if (!order) notFound();

  const paymentMethod = manualPaymentMethodSchema.safeParse(
    order.paymentMethod,
  );
  const settings = await getPublicStoreSettings();
  const baseInstructions =
    order.paymentStatus === "pending" && paymentMethod.success
      ? buildPaymentInstructions(paymentMethod.data, settings)
      : null;
  const paymentName = paymentMethod.success
    ? (manualPaymentMethods.find((method) => method.code === paymentMethod.data)
        ?.name ?? "Pago manual")
    : "Pago manual";
  const paymentInstructions = baseInstructions
    ? {
        ...baseInstructions,
        confirmationUrl:
          paymentMethod.success && paymentMethod.data !== "cash_on_delivery"
            ? buildPaymentProofWhatsAppUrl(settings, {
                paymentMethodName: paymentName,
                reference: order.reference,
                totalInCop: order.totalInCop,
              })
            : null,
      }
    : null;

  return (
    <main id="main-content" tabIndex={-1} className="bg-background flex-1">
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
        <Link className="text-brand-dark text-sm font-bold" href="/cuenta">
          ← Volver a mi cuenta
        </Link>
        <section className="border-line bg-surface mt-5 rounded-[1.75rem] border p-5 sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-brand-dark font-mono text-sm font-bold">
                {order.reference}
              </p>
              <h1 className="font-display text-foreground mt-1 text-3xl font-bold">
                {statusLabels[order.status] ?? order.status}
              </h1>
              <p className="text-muted mt-2 text-sm">
                Creado el {new Date(order.createdAt).toLocaleString("es-CO")}
              </p>
            </div>
            <p className="font-display text-foreground text-2xl font-bold">
              {formatCurrency(order.totalInCop)}
            </p>
          </div>

          <dl className="bg-background mt-6 grid gap-4 rounded-2xl p-5 sm:grid-cols-3">
            <div>
              <dt className="text-muted text-xs uppercase">Pago</dt>
              <dd className="text-foreground mt-1 font-semibold">
                {statusLabels[order.paymentStatus] ?? order.paymentStatus}
              </dd>
            </div>
            <div>
              <dt className="text-muted text-xs uppercase">Método</dt>
              <dd className="text-foreground mt-1 font-semibold">
                {paymentName}
              </dd>
            </div>
            <div>
              <dt className="text-muted text-xs uppercase">Entrega</dt>
              <dd className="text-foreground mt-1 font-semibold">
                {order.shippingMethodName}
              </dd>
            </div>
          </dl>

          {order.shippingCarrier && order.trackingNumber ? (
            <section className="border-brand/20 bg-brand-soft mt-6 rounded-2xl border p-5">
              <p className="text-brand-dark text-xs font-bold tracking-widest uppercase">
                Seguimiento
              </p>
              <h2 className="font-display text-foreground mt-2 text-xl font-bold">
                Envío con {order.shippingCarrier}
              </h2>
              <p className="text-muted mt-2 text-sm">
                Guía:{" "}
                <strong className="text-foreground font-mono">
                  {order.trackingNumber}
                </strong>
              </p>
              {order.estimatedDeliveryAt ? (
                <p className="text-muted mt-1 text-sm">
                  Entrega estimada:{" "}
                  {new Date(order.estimatedDeliveryAt).toLocaleDateString(
                    "es-CO",
                  )}
                </p>
              ) : null}
              {order.trackingUrl ? (
                <a
                  className="bg-foreground hover:bg-brand-dark mt-4 inline-flex rounded-full px-5 py-2.5 text-sm font-bold text-white transition"
                  href={order.trackingUrl}
                  rel="noreferrer"
                  target="_blank"
                >
                  Rastrear envío →
                </a>
              ) : null}
            </section>
          ) : null}

          {paymentInstructions ? (
            <PaymentInstructions
              instructions={paymentInstructions}
              reference={order.reference}
              totalInCop={order.totalInCop}
            />
          ) : null}

          <h2 className="font-display text-foreground mt-7 text-xl font-bold">
            Productos
          </h2>
          <div className="divide-line mt-2 divide-y">
            {order.items.map((item) => (
              <div
                className="flex justify-between gap-4 py-4 text-sm"
                key={item.id}
              >
                <div>
                  <p className="text-foreground font-semibold">
                    {item.quantity} × {item.productName}
                  </p>
                  <p className="text-muted">{item.variantName}</p>
                </div>
                <p className="text-foreground font-semibold">
                  {formatCurrency(item.lineTotalInCop)}
                </p>
              </div>
            ))}
          </div>

          <dl className="border-line mt-5 ml-auto max-w-sm space-y-2 border-t pt-5 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-muted">Subtotal</dt>
              <dd>{formatCurrency(order.subtotalInCop)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted">Envío</dt>
              <dd>{formatCurrency(order.shippingInCop)}</dd>
            </div>
            <div className="flex justify-between gap-4 text-base font-bold">
              <dt>Total</dt>
              <dd>{formatCurrency(order.totalInCop)}</dd>
            </div>
          </dl>
        </section>
      </div>
    </main>
  );
}
