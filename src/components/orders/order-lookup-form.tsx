"use client";

import { useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";

import { manualPaymentMethods } from "@/features/payments/payment-methods";
import { formatCurrency } from "@/lib/format-currency";

type PublicOrder = {
  createdAt: string;
  items: Array<{
    id: string;
    lineTotalInCop: number;
    productName: string;
    quantity: number;
    variantName: string;
  }>;
  paymentMethod: string;
  paymentStatus: string;
  reference: string;
  reservationExpiresAt: string;
  shippingInCop: number;
  shippingMethodName: string;
  status: string;
  subtotalInCop: number;
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
  "h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-950";

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
        className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-5"
        onSubmit={submit}
      >
        <label className="grid gap-1 text-sm font-semibold text-slate-700">
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
        <label className="grid gap-1 text-sm font-semibold text-slate-700">
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
          className="h-11 rounded-xl bg-slate-950 px-4 text-sm font-bold text-white disabled:bg-slate-400"
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
    <section className="rounded-2xl border border-dashed border-slate-300 bg-white p-8">
      <h2 className="text-xl font-bold text-slate-950">
        Ten a mano los datos de la compra
      </h2>
      <p className="mt-2 max-w-xl text-slate-600">
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
    <section className="rounded-2xl border border-slate-200 bg-white p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="font-mono text-sm font-bold text-cyan-800">
            {order.reference}
          </p>
          <h2 className="mt-1 text-2xl font-bold text-slate-950">
            {statusLabels[order.status] ?? order.status}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Creado el {new Date(order.createdAt).toLocaleString("es-CO")}
          </p>
        </div>
        <p className="text-2xl font-bold text-slate-950">
          {formatCurrency(order.totalInCop)}
        </p>
      </div>

      <dl className="mt-6 grid gap-3 rounded-xl bg-slate-50 p-4 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-slate-500">Estado del pago</dt>
          <dd className="font-semibold text-slate-950">
            {statusLabels[order.paymentStatus] ?? order.paymentStatus}
          </dd>
        </div>
        <div>
          <dt className="text-slate-500">Método de pago</dt>
          <dd className="font-semibold text-slate-950">{paymentName}</dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="text-slate-500">Entrega</dt>
          <dd className="font-semibold text-slate-950">
            {order.shippingMethodName}
          </dd>
        </div>
      </dl>

      <h3 className="mt-6 font-bold text-slate-950">Productos</h3>
      <div className="mt-2 divide-y divide-slate-100">
        {order.items.map((item) => (
          <div
            className="flex justify-between gap-4 py-3 text-sm"
            key={item.id}
          >
            <div>
              <p className="font-semibold text-slate-950">
                {item.quantity} × {item.productName}
              </p>
              <p className="text-slate-500">{item.variantName}</p>
            </div>
            <p className="font-semibold text-slate-950">
              {formatCurrency(item.lineTotalInCop)}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
