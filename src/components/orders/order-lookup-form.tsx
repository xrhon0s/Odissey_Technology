"use client";

import { useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";

import { PaymentInstructions } from "@/components/payments/payment-instructions";
import { manualPaymentMethods } from "@/features/payments/payment-methods";
import type { PaymentInstructionsData } from "@/features/payments/payment-methods";
import { formatCurrency } from "@/lib/format-currency";

type PublicOrder = {
  createdAt: string;
  estimatedDeliveryAt: string | null;
  items: Array<{
    id: string;
    lineTotalInCop: number;
    productName: string;
    quantity: number;
    variantName: string;
  }>;
  paymentMethod: string;
  paymentInstructions: PaymentInstructionsData | null;
  paymentStatus: string;
  reference: string;
  reservationExpiresAt: string;
  shippingInCop: number;
  shippingCarrier: string | null;
  shippingMethodName: string;
  status: string;
  subtotalInCop: number;
  trackingNumber: string | null;
  trackingUrl: string | null;
  totalInCop: number;
};

type LookupResponse =
  | { ok: true; order: PublicOrder }
  | { code: string; message: string; ok: false };

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

const inputClass =
  "h-11 w-full rounded-xl border border-line bg-surface px-3 text-sm text-foreground outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/10";

export function OrderLookupForm() {
  const searchParams = useSearchParams();
  const [order, setOrder] = useState<PublicOrder | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setOrder(null);
    setPending(true);
    const formData = new FormData(event.currentTarget);

    try {
      const response = await fetch("/api/orders/status", {
        body: JSON.stringify({
          email: formData.get("email"),
          reference: formData.get("reference"),
        }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });
      const result = (await response.json()) as LookupResponse;

      if (!result.ok) {
        setError(result.message);
        return;
      }

      setOrder(result.order);
    } catch {
      setError("No pudimos conectar con el servidor. Inténtalo nuevamente.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[360px_1fr] lg:items-start">
      <form
        className="border-line bg-surface grid gap-4 rounded-[1.5rem] border p-5"
        onSubmit={submit}
      >
        <label className="text-foreground grid gap-1.5 text-sm font-semibold">
          Referencia del pedido
          <input
            className={inputClass}
            defaultValue={searchParams.get("reference") ?? ""}
            maxLength={40}
            name="reference"
            placeholder="OD-..."
            required
          />
        </label>
        <label className="text-foreground grid gap-1.5 text-sm font-semibold">
          Correo usado en la compra
          <input
            autoComplete="email"
            className={inputClass}
            maxLength={254}
            name="email"
            required
            type="email"
          />
        </label>
        <button
          className="bg-foreground hover:bg-brand-dark h-11 rounded-full px-4 text-sm font-bold text-white transition disabled:bg-slate-400"
          disabled={pending}
          type="submit"
        >
          {pending ? "Consultando…" : "Consultar pedido"}
        </button>
        {error ? (
          <p className="text-sm text-red-700" role="alert">
            {error}
          </p>
        ) : null}
      </form>

      {order ? <OrderStatus order={order} /> : <LookupInstructions />}
    </div>
  );
}

function LookupInstructions() {
  return (
    <section className="border-line bg-surface rounded-[1.5rem] border border-dashed p-8">
      <span
        aria-hidden="true"
        className="bg-brand-soft text-brand-dark grid size-12 place-items-center rounded-full text-xl"
      >
        ⌕
      </span>
      <h2 className="font-display text-foreground mt-5 text-xl font-bold">
        Ten a mano los datos de la compra
      </h2>
      <p className="text-muted mt-2 max-w-xl leading-7">
        Por seguridad, pedimos la referencia completa y el mismo correo usado al
        crear el pedido. La consulta no muestra tu dirección ni tu teléfono.
      </p>
    </section>
  );
}

function OrderStatus({ order }: { order: PublicOrder }) {
  const paymentName =
    manualPaymentMethods.find((method) => method.code === order.paymentMethod)
      ?.name ?? "Pago manual";

  return (
    <section className="border-line bg-surface rounded-[1.5rem] border p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-brand-dark font-mono text-sm font-bold">
            {order.reference}
          </p>
          <h2 className="font-display text-foreground mt-1 text-2xl font-bold">
            {statusLabels[order.status] ?? order.status}
          </h2>
          <p className="text-muted mt-1 text-sm">
            Creado el {new Date(order.createdAt).toLocaleString("es-CO")}
          </p>
        </div>
        <p className="font-display text-foreground text-2xl font-bold">
          {formatCurrency(order.totalInCop)}
        </p>
      </div>

      <dl className="bg-background mt-6 grid gap-3 rounded-xl p-4 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-slate-500">Estado del pago</dt>
          <dd className="text-foreground font-semibold">
            {statusLabels[order.paymentStatus] ?? order.paymentStatus}
          </dd>
        </div>
        <div>
          <dt className="text-slate-500">Método de pago</dt>
          <dd className="text-foreground font-semibold">{paymentName}</dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="text-slate-500">Entrega</dt>
          <dd className="text-foreground font-semibold">
            {order.shippingMethodName}
          </dd>
        </div>
      </dl>

      {order.shippingCarrier && order.trackingNumber ? (
        <section className="border-brand/20 bg-brand-soft mt-6 rounded-2xl border p-5">
          <p className="text-brand-dark text-xs font-bold tracking-widest uppercase">
            Seguimiento del envío
          </p>
          <h3 className="font-display text-foreground mt-2 text-xl font-bold">
            Tu pedido va con {order.shippingCarrier}
          </h3>
          <p className="text-muted mt-2 text-sm">
            Guía:{" "}
            <strong className="text-foreground font-mono">
              {order.trackingNumber}
            </strong>
          </p>
          {order.estimatedDeliveryAt ? (
            <p className="text-muted mt-1 text-sm">
              Entrega estimada:{" "}
              {new Date(order.estimatedDeliveryAt).toLocaleDateString("es-CO")}
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

      {order.paymentStatus === "pending" && order.paymentInstructions ? (
        <PaymentInstructions
          instructions={order.paymentInstructions}
          reference={order.reference}
          totalInCop={order.totalInCop}
        />
      ) : null}

      <h3 className="text-foreground mt-6 font-bold">Productos</h3>
      <div className="divide-line mt-2 divide-y">
        {order.items.map((item) => (
          <div
            className="flex justify-between gap-4 py-3 text-sm"
            key={item.id}
          >
            <div>
              <p className="text-foreground font-semibold">
                {item.quantity} × {item.productName}
              </p>
              <p className="text-slate-500">{item.variantName}</p>
            </div>
            <p className="text-foreground font-semibold">
              {formatCurrency(item.lineTotalInCop)}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
