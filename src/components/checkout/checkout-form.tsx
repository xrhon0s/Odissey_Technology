"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";

import {
  checkoutFormSchema,
  type CheckoutFormValues,
  type CheckoutQuoteRequest,
} from "@/features/checkout/checkout-schema";
import type {
  CheckoutQuote,
  CheckoutShippingMethod,
} from "@/features/checkout/checkout-service";
import {
  manualPaymentMethods,
  type ManualPaymentMethod,
} from "@/features/payments/payment-methods";
import {
  PRIVACY_POLICY_VERSION,
  TERMS_VERSION,
} from "@/features/legal/legal-documents";
import { formatCurrency } from "@/lib/format-currency";
import { useCartStore } from "@/stores/cart-store";

type QuoteResponse =
  | { ok: true; quote: CheckoutQuote }
  | { code: string; message: string; ok: false };

type OrderResponse =
  | {
      ok: true;
      order: {
        id: string;
        paymentMethod: ManualPaymentMethod;
        paymentStatus: "pending";
        reference: string;
        reservationExpiresAt: string;
        reused: boolean;
        status: "pending";
        totalInCop: number;
      };
    }
  | { code: string; message: string; ok: false };

type CheckoutFormProps = {
  shippingMethods: CheckoutShippingMethod[];
};

const inputClassName =
  "h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-950 shadow-sm focus:border-cyan-600";

export function CheckoutForm({ shippingMethods }: CheckoutFormProps) {
  const clearCart = useCartStore((state) => state.clear);
  const hasHydrated = useCartStore((state) => state.hasHydrated);
  const items = useCartStore((state) => state.items);
  const [quote, setQuote] = useState<CheckoutQuote | null>(null);
  const [quotedCheckout, setQuotedCheckout] =
    useState<CheckoutQuoteRequest | null>(null);
  const [order, setOrder] = useState<
    Extract<OrderResponse, { ok: true }>["order"] | null
  >(null);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [checkoutAttemptId, setCheckoutAttemptId] = useState<string | null>(
    null,
  );
  const defaultShippingMethod = shippingMethods[0]?.code ?? "";
  const {
    control,
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
  } = useForm<CheckoutFormValues>({
    defaultValues: {
      acceptedTerms: false,
      address: {
        addressLine1: "",
        addressLine2: "",
        city: "",
        deliveryNotes: "",
        department: "",
        neighborhood: "",
      },
      customer: { email: "", fullName: "", phone: "" },
      paymentMethod: "nequi",
      shippingMethodCode: defaultShippingMethod,
    },
    resolver: zodResolver(checkoutFormSchema),
    shouldUnregister: true,
  });
  const selectedShippingCode = useWatch({
    control,
    name: "shippingMethodCode",
  });
  const selectedPaymentCode = useWatch({
    control,
    name: "paymentMethod",
  });
  const selectedShippingMethod = shippingMethods.find(
    (shippingMethod) => shippingMethod.code === selectedShippingCode,
  );
  const selectedPaymentMethod = manualPaymentMethods.find(
    (paymentMethod) => paymentMethod.code === selectedPaymentCode,
  );

  if (!hasHydrated) {
    return (
      <div aria-busy="true" className="grid animate-pulse gap-6 lg:grid-cols-2">
        <div className="h-96 rounded-2xl bg-slate-200" />
        <div className="h-72 rounded-2xl bg-slate-200" />
      </div>
    );
  }

  if (order) {
    return (
      <section className="mx-auto max-w-2xl rounded-2xl border border-emerald-200 bg-white p-6 text-center shadow-sm sm:p-10">
        <p className="text-sm font-bold tracking-widest text-emerald-700 uppercase">
          Pedido creado
        </p>
        <h2 className="mt-3 text-2xl font-bold text-slate-950 sm:text-3xl">
          Referencia {order.reference}
        </h2>
        <p className="mt-4 text-slate-600">
          El pedido está pendiente y reservamos tus productos mientras
          coordinamos la confirmación del pago.
        </p>
        <dl className="mx-auto mt-6 max-w-sm space-y-3 rounded-xl bg-slate-50 p-5 text-left">
          <div className="flex justify-between gap-4">
            <dt className="text-slate-600">Estado</dt>
            <dd className="font-semibold text-slate-950">Pendiente</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-slate-600">Forma de pago</dt>
            <dd className="text-right font-semibold text-slate-950">
              {manualPaymentMethods.find(
                (method) => method.code === order.paymentMethod,
              )?.name ?? "Pago manual"}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-slate-600">Total</dt>
            <dd className="font-semibold text-slate-950">
              {formatCurrency(order.totalInCop)}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-slate-600">Reserva hasta</dt>
            <dd className="text-right font-semibold text-slate-950">
              {new Date(order.reservationExpiresAt).toLocaleTimeString(
                "es-CO",
                { hour: "numeric", minute: "2-digit" },
              )}
            </dd>
          </div>
        </dl>
        <div className="mt-6 rounded-xl bg-amber-50 p-4 text-left text-sm leading-6 text-amber-900">
          <p className="font-semibold">Siguiente paso</p>
          {order.paymentMethod === "cash_on_delivery" ? (
            <p className="mt-1">
              Conserva la referencia y ten disponible el valor exacto en
              efectivo. El equipo confirmará la entrega antes de despachar.
            </p>
          ) : (
            <p className="mt-1">
              Conserva la referencia del pedido. El equipo te compartirá los
              datos de transferencia y confirmará el pedido después de revisar
              el comprobante.
            </p>
          )}
        </div>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link
            href={`/pedido?reference=${encodeURIComponent(order.reference)}`}
            className="inline-flex rounded-xl bg-cyan-700 px-5 py-3 text-sm font-semibold text-white"
          >
            Consultar este pedido
          </Link>
          <Link
            href="/catalogo"
            className="inline-flex rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white"
          >
            Volver al catálogo
          </Link>
        </div>
      </section>
    );
  }
  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
        <h2 className="text-xl font-bold text-slate-950">
          No hay productos para cotizar
        </h2>
        <p className="mt-2 text-slate-600">
          Agrega productos al carrito antes de continuar.
        </p>
        <Link
          href="/catalogo"
          className="mt-6 inline-flex rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white"
        >
          Ver catálogo
        </Link>
      </div>
    );
  }

  async function submitCheckout(values: CheckoutFormValues) {
    setQuote(null);
    setQuotedCheckout(null);
    setServerError(null);
    setCheckoutAttemptId(null);

    const checkout: CheckoutQuoteRequest = {
      acceptedTerms: true,
      address: selectedShippingMethod?.requiresAddress
        ? values.address
        : undefined,
      customer: values.customer,
      items: items.map((item) => ({
        quantity: item.quantity,
        variantId: item.variantId,
      })),
      paymentMethod: values.paymentMethod,
      privacyPolicyVersion: PRIVACY_POLICY_VERSION,
      shippingMethodCode: values.shippingMethodCode,
      termsVersion: TERMS_VERSION,
    };

    try {
      const response = await fetch("/api/checkout/quote", {
        body: JSON.stringify(checkout),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });
      const result = (await response.json()) as QuoteResponse;

      if (!result.ok) {
        setServerError(result.message);
        return;
      }

      setQuote(result.quote);
      setQuotedCheckout(checkout);
    } catch {
      setServerError(
        "No pudimos conectar con el servidor. Inténtalo nuevamente.",
      );
    }
  }

  async function createOrder() {
    if (!quotedCheckout) return;

    setIsCreatingOrder(true);
    setServerError(null);
    const currentCheckoutAttemptId = checkoutAttemptId ?? crypto.randomUUID();
    setCheckoutAttemptId(currentCheckoutAttemptId);

    try {
      const response = await fetch("/api/orders", {
        body: JSON.stringify({
          checkout: quotedCheckout,
          checkoutAttemptId: currentCheckoutAttemptId,
        }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });
      const result = (await response.json()) as OrderResponse;

      if (!result.ok) {
        setServerError(result.message);
        return;
      }

      setOrder(result.order);
      clearCart();
    } catch {
      setServerError(
        "No pudimos conectar con el servidor. Inténtalo nuevamente.",
      );
    } finally {
      setIsCreatingOrder(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit(submitCheckout)}
      className="grid gap-8 lg:grid-cols-[1fr_380px] lg:items-start"
    >
      <div className="space-y-6">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
          <h2 className="text-xl font-bold text-slate-950">Tus datos</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <Field
              label="Nombre completo"
              error={errors.customer?.fullName?.message}
            >
              <input
                autoComplete="name"
                className={inputClassName}
                {...register("customer.fullName")}
              />
            </Field>
            <Field label="Celular" error={errors.customer?.phone?.message}>
              <input
                autoComplete="tel"
                inputMode="tel"
                placeholder="3001234567"
                className={inputClassName}
                {...register("customer.phone")}
              />
            </Field>
            <Field
              label="Correo electrónico"
              error={errors.customer?.email?.message}
              className="sm:col-span-2"
            >
              <input
                autoComplete="email"
                inputMode="email"
                type="email"
                className={inputClassName}
                {...register("customer.email")}
              />
            </Field>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
          <h2 className="text-xl font-bold text-slate-950">Entrega</h2>
          <div className="mt-5 space-y-3">
            {shippingMethods.map((method) => (
              <label
                key={method.code}
                className="flex cursor-pointer gap-3 rounded-xl border border-slate-200 p-4 has-checked:border-cyan-600 has-checked:bg-cyan-50"
              >
                <input
                  type="radio"
                  value={method.code}
                  className="mt-1 size-4 accent-cyan-700"
                  {...register("shippingMethodCode")}
                />
                <span className="flex-1">
                  <span className="flex justify-between gap-3 font-semibold text-slate-950">
                    {method.name}
                    <span>{formatCurrency(method.priceInCop)}</span>
                  </span>
                  <span className="mt-1 block text-sm text-slate-600">
                    {method.description}
                  </span>
                </span>
              </label>
            ))}
            {errors.shippingMethodCode && (
              <p className="text-sm text-red-700">
                {errors.shippingMethodCode.message}
              </p>
            )}
          </div>

          {selectedShippingMethod?.requiresAddress && (
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <Field
                label="Departamento"
                error={errors.address?.department?.message}
              >
                <input
                  autoComplete="address-level1"
                  className={inputClassName}
                  {...register("address.department")}
                />
              </Field>
              <Field label="Ciudad" error={errors.address?.city?.message}>
                <input
                  autoComplete="address-level2"
                  className={inputClassName}
                  {...register("address.city")}
                />
              </Field>
              <Field
                label="Dirección"
                error={errors.address?.addressLine1?.message}
                className="sm:col-span-2"
              >
                <input
                  autoComplete="street-address"
                  className={inputClassName}
                  {...register("address.addressLine1")}
                />
              </Field>
              <Field label="Complemento (opcional)">
                <input
                  className={inputClassName}
                  {...register("address.addressLine2")}
                />
              </Field>
              <Field label="Barrio (opcional)">
                <input
                  className={inputClassName}
                  {...register("address.neighborhood")}
                />
              </Field>
              <Field label="Indicaciones (opcional)" className="sm:col-span-2">
                <textarea
                  rows={3}
                  className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 shadow-sm focus:border-cyan-600"
                  {...register("address.deliveryNotes")}
                />
              </Field>
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
          <h2 className="text-xl font-bold text-slate-950">Forma de pago</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Todos los pagos se verifican manualmente antes de confirmar el
            pedido.
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {manualPaymentMethods.map((method) => (
              <label
                key={method.code}
                className="flex cursor-pointer gap-3 rounded-xl border border-slate-200 p-4 has-checked:border-cyan-600 has-checked:bg-cyan-50"
              >
                <input
                  type="radio"
                  value={method.code}
                  className="mt-1 size-4 accent-cyan-700"
                  {...register("paymentMethod")}
                />
                <span>
                  <span className="font-semibold text-slate-950">
                    {method.name}
                  </span>
                  <span className="mt-1 block text-sm leading-5 text-slate-600">
                    {method.description}
                  </span>
                  {method.requiresMetropolitanDelivery && (
                    <span className="mt-2 inline-flex rounded-full bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-900">
                      Solo Valle de Aburrá
                    </span>
                  )}
                </span>
              </label>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
          <label className="flex items-start gap-3 text-sm leading-6 text-slate-700">
            <input
              type="checkbox"
              className="mt-1 size-4 shrink-0 accent-cyan-700"
              {...register("acceptedTerms")}
            />
            <span>
              Acepto los{" "}
              <Link
                href="/terminos-y-condiciones"
                target="_blank"
                className="font-semibold text-cyan-800 hover:underline"
              >
                términos y condiciones
              </Link>{" "}
              y la{" "}
              <Link
                href="/politica-de-privacidad"
                target="_blank"
                className="font-semibold text-cyan-800 hover:underline"
              >
                política de tratamiento de datos
              </Link>
              .
            </span>
          </label>
          {errors.acceptedTerms ? (
            <p className="mt-2 text-sm text-red-700">
              {errors.acceptedTerms.message}
            </p>
          ) : null}
        </section>
      </div>

      <aside className="rounded-2xl bg-slate-950 p-6 text-white lg:sticky lg:top-6">
        <h2 className="text-lg font-bold">Revisión segura</h2>
        <p className="mt-2 text-sm leading-6 text-slate-300">
          Validaremos precios, disponibilidad y envío directamente en el
          servidor.
        </p>
        <div className="mt-5 space-y-3 border-t border-slate-700 pt-5 text-sm">
          {items.map((item) => (
            <div key={item.variantId} className="flex justify-between gap-4">
              <span className="text-slate-300">
                {item.quantity} × {item.productName}
              </span>
              <span>{formatCurrency(item.unitPriceInCop * item.quantity)}</span>
            </div>
          ))}
        </div>

        {serverError && (
          <p
            role="alert"
            className="mt-5 rounded-xl bg-red-950 p-3 text-sm text-red-100"
          >
            {serverError}
          </p>
        )}

        {quote && (
          <div
            className="mt-5 rounded-xl bg-emerald-950 p-4"
            aria-live="polite"
          >
            <p className="font-semibold text-emerald-100">
              Cotización validada
            </p>
            <dl className="mt-3 space-y-2 text-sm text-emerald-50">
              <div className="flex justify-between">
                <dt>Productos</dt>
                <dd>{formatCurrency(quote.subtotalInCop)}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Envío</dt>
                <dd>{formatCurrency(quote.shippingInCop)}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt>Pago</dt>
                <dd className="text-right">
                  {selectedPaymentMethod?.name ?? "Pago manual"}
                </dd>
              </div>
              <div className="flex justify-between border-t border-emerald-800 pt-2 font-bold">
                <dt>Total</dt>
                <dd>{formatCurrency(quote.totalInCop)}</dd>
              </div>
            </dl>
            <p className="mt-3 text-xs leading-5 text-emerald-200">
              Los productos se reservarán por 30 minutos al crear el pedido.
            </p>
            <button
              type="button"
              onClick={createOrder}
              disabled={isCreatingOrder}
              className="mt-4 h-11 w-full rounded-xl bg-emerald-400 text-sm font-bold text-emerald-950 hover:bg-emerald-300 disabled:cursor-not-allowed disabled:bg-emerald-900 disabled:text-emerald-300"
            >
              {isCreatingOrder ? "Creando pedido…" : "Crear pedido pendiente"}
            </button>
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting || shippingMethods.length === 0}
          className="mt-6 h-12 w-full rounded-xl bg-cyan-500 text-sm font-bold text-slate-950 hover:bg-cyan-400 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-300"
        >
          {isSubmitting ? "Validando…" : "Validar compra"}
        </button>
        <Link
          href="/carrito"
          className="mt-4 block text-center text-sm font-semibold text-slate-300 hover:text-white"
        >
          Volver al carrito
        </Link>
      </aside>
    </form>
  );
}

type FieldProps = {
  children: React.ReactNode;
  className?: string;
  error?: string;
  label: string;
};

function Field({ children, className = "", error, label }: FieldProps) {
  return (
    <label
      className={`grid gap-1.5 text-sm font-semibold text-slate-700 ${className}`}
    >
      {label}
      {children}
      {error && <span className="text-xs text-red-700">{error}</span>}
    </label>
  );
}
