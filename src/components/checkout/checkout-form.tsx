"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";

import { PaymentInstructions } from "@/components/payments/payment-instructions";
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
  type ManualPaymentMethod,
  type ManualPaymentMethodOption,
  type PaymentInstructionsData,
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
        paymentInstructions: PaymentInstructionsData | null;
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
  customer: {
    email: string;
    fullName: string;
    id: string;
    phone: string | null;
  } | null;
  paymentMethods: ManualPaymentMethodOption[];
  shippingMethods: CheckoutShippingMethod[];
};

const inputClassName =
  "h-11 w-full min-w-0 rounded-xl border border-line bg-surface px-3 text-sm text-foreground outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/10";

export function CheckoutForm({
  customer,
  paymentMethods,
  shippingMethods,
}: CheckoutFormProps) {
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
  const defaultPaymentMethod = paymentMethods[0]?.code ?? "nequi";
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
      customer: {
        email: customer?.email ?? "",
        fullName: customer?.fullName ?? "",
        phone: customer?.phone ?? "",
      },
      paymentMethod: defaultPaymentMethod,
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
  const selectedPaymentMethod = paymentMethods.find(
    (paymentMethod) => paymentMethod.code === selectedPaymentCode,
  );

  if (!hasHydrated) {
    return (
      <div aria-busy="true" className="grid animate-pulse gap-6 lg:grid-cols-2">
        <div className="skeleton-shimmer bg-surface-muted h-96 rounded-2xl" />
        <div className="skeleton-shimmer bg-surface-muted h-72 rounded-2xl" />
      </div>
    );
  }

  if (order) {
    return (
      <section className="bg-surface mx-auto max-w-2xl rounded-[1.75rem] border border-emerald-200 p-6 text-center shadow-sm sm:p-10">
        <p className="text-sm font-bold tracking-widest text-emerald-700 uppercase">
          Pedido creado
        </p>
        <h2 className="font-display text-foreground mt-3 text-2xl font-bold sm:text-3xl">
          Referencia {order.reference}
        </h2>
        <p className="text-muted mt-4">
          El pedido está pendiente y reservamos tus productos mientras
          coordinamos la confirmación del pago.
        </p>
        <dl className="bg-background mx-auto mt-6 max-w-sm space-y-3 rounded-xl p-5 text-left">
          <div className="flex justify-between gap-4">
            <dt className="text-slate-600">Estado</dt>
            <dd className="text-foreground font-semibold">Pendiente</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-slate-600">Forma de pago</dt>
            <dd className="text-foreground text-right font-semibold">
              {paymentMethods.find(
                (method) => method.code === order.paymentMethod,
              )?.name ?? "Pago manual"}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-slate-600">Total</dt>
            <dd className="text-foreground font-semibold">
              {formatCurrency(order.totalInCop)}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-slate-600">Reserva hasta</dt>
            <dd className="text-foreground text-right font-semibold">
              {new Date(order.reservationExpiresAt).toLocaleTimeString(
                "es-CO",
                { hour: "numeric", minute: "2-digit" },
              )}
            </dd>
          </div>
        </dl>
        {order.paymentInstructions ? (
          <PaymentInstructions
            instructions={order.paymentInstructions}
            reference={order.reference}
            totalInCop={order.totalInCop}
          />
        ) : null}
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link
            href={
              customer
                ? `/cuenta/pedidos/${order.id}`
                : `/pedido?reference=${encodeURIComponent(order.reference)}`
            }
            className="bg-brand text-foreground hover:bg-brand-dark inline-flex rounded-full px-5 py-3 text-sm font-semibold transition hover:text-white"
          >
            {customer ? "Ver en mi cuenta" : "Consultar este pedido"}
          </Link>
          <Link
            href="/catalogo"
            className="bg-foreground hover:bg-brand-dark inline-flex rounded-full px-5 py-3 text-sm font-semibold text-white transition"
          >
            Volver al catálogo
          </Link>
        </div>
      </section>
    );
  }
  if (items.length === 0) {
    return (
      <div className="border-line bg-surface rounded-[1.75rem] border border-dashed px-6 py-16 text-center">
        <h2 className="font-display text-foreground text-xl font-bold">
          No hay productos para cotizar
        </h2>
        <p className="text-muted mt-2">
          Agrega productos al carrito antes de continuar.
        </p>
        <Link
          href="/catalogo"
          className="bg-foreground hover:bg-brand-dark mt-6 inline-flex rounded-full px-5 py-3 text-sm font-semibold text-white transition"
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
      aria-busy={isSubmitting || isCreatingOrder}
      onSubmit={handleSubmit(submitCheckout)}
      className="grid gap-8 lg:grid-cols-[1fr_380px] lg:items-start"
    >
      <div className="space-y-6">
        <section className="border-line bg-surface rounded-[1.5rem] border p-5 sm:p-6">
          <h2 className="font-display text-foreground text-xl font-bold">
            Tus datos
          </h2>
          {customer ? (
            <p className="text-muted mt-1 text-sm">
              Completamos estos campos desde tu cuenta. Puedes ajustarlos para
              este pedido.
            </p>
          ) : (
            <p className="text-muted mt-1 text-sm">
              ¿Quieres conservar tus pedidos?{" "}
              <Link
                className="text-brand-dark font-semibold underline-offset-4 hover:underline"
                href="/cuenta/acceder?next=/checkout"
              >
                Inicia sesión
              </Link>
            </p>
          )}
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <Field
              id="customer-full-name"
              label="Nombre completo"
              error={errors.customer?.fullName?.message}
            >
              <input
                id="customer-full-name"
                aria-invalid={Boolean(errors.customer?.fullName)}
                aria-describedby={
                  errors.customer?.fullName
                    ? "customer-full-name-error"
                    : undefined
                }
                autoComplete="name"
                className={inputClassName}
                {...register("customer.fullName")}
              />
            </Field>
            <Field
              id="customer-phone"
              label="Celular"
              error={errors.customer?.phone?.message}
            >
              <input
                id="customer-phone"
                aria-invalid={Boolean(errors.customer?.phone)}
                aria-describedby={
                  errors.customer?.phone ? "customer-phone-error" : undefined
                }
                autoComplete="tel"
                inputMode="tel"
                placeholder="3001234567"
                className={inputClassName}
                {...register("customer.phone")}
              />
            </Field>
            <Field
              id="customer-email"
              label="Correo electrónico"
              error={errors.customer?.email?.message}
              className="sm:col-span-2"
            >
              <input
                id="customer-email"
                aria-invalid={Boolean(errors.customer?.email)}
                aria-describedby={
                  errors.customer?.email ? "customer-email-error" : undefined
                }
                autoComplete="email"
                inputMode="email"
                type="email"
                className={inputClassName}
                {...register("customer.email")}
              />
            </Field>
          </div>
        </section>

        <section className="border-line bg-surface rounded-[1.5rem] border p-5 sm:p-6">
          <h2
            id="shipping-method-title"
            className="font-display text-foreground text-xl font-bold"
          >
            Entrega
          </h2>
          <div
            role="radiogroup"
            aria-invalid={Boolean(errors.shippingMethodCode)}
            aria-labelledby="shipping-method-title"
            aria-describedby={
              errors.shippingMethodCode ? "shipping-method-error" : undefined
            }
            className="mt-5 space-y-3"
          >
            {shippingMethods.map((method) => (
              <label
                key={method.code}
                className="border-line has-checked:border-brand has-checked:bg-brand-soft flex cursor-pointer gap-3 rounded-xl border p-4 transition"
              >
                <input
                  type="radio"
                  value={method.code}
                  className="accent-brand mt-1 size-4"
                  {...register("shippingMethodCode")}
                />
                <span className="flex-1">
                  <span className="text-foreground flex justify-between gap-3 font-semibold">
                    {method.name}
                    <span>{formatCurrency(method.priceInCop)}</span>
                  </span>
                  <span className="text-muted mt-1 block text-sm">
                    {method.description}
                  </span>
                </span>
              </label>
            ))}
            {errors.shippingMethodCode && (
              <p
                id="shipping-method-error"
                role="alert"
                className="text-sm text-red-700"
              >
                {errors.shippingMethodCode.message}
              </p>
            )}
          </div>

          {selectedShippingMethod?.requiresAddress && (
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <Field
                id="address-department"
                label="Departamento"
                error={errors.address?.department?.message}
              >
                <input
                  id="address-department"
                  aria-invalid={Boolean(errors.address?.department)}
                  aria-describedby={
                    errors.address?.department
                      ? "address-department-error"
                      : undefined
                  }
                  autoComplete="address-level1"
                  className={inputClassName}
                  {...register("address.department")}
                />
              </Field>
              <Field
                id="address-city"
                label="Ciudad"
                error={errors.address?.city?.message}
              >
                <input
                  id="address-city"
                  aria-invalid={Boolean(errors.address?.city)}
                  aria-describedby={
                    errors.address?.city ? "address-city-error" : undefined
                  }
                  autoComplete="address-level2"
                  className={inputClassName}
                  {...register("address.city")}
                />
              </Field>
              <Field
                id="address-line-1"
                label="Dirección"
                error={errors.address?.addressLine1?.message}
                className="sm:col-span-2"
              >
                <input
                  id="address-line-1"
                  aria-invalid={Boolean(errors.address?.addressLine1)}
                  aria-describedby={
                    errors.address?.addressLine1
                      ? "address-line-1-error"
                      : undefined
                  }
                  autoComplete="street-address"
                  className={inputClassName}
                  {...register("address.addressLine1")}
                />
              </Field>
              <Field id="address-line-2" label="Complemento (opcional)">
                <input
                  id="address-line-2"
                  autoComplete="address-line2"
                  className={inputClassName}
                  {...register("address.addressLine2")}
                />
              </Field>
              <Field id="address-neighborhood" label="Barrio (opcional)">
                <input
                  id="address-neighborhood"
                  className={inputClassName}
                  {...register("address.neighborhood")}
                />
              </Field>
              <Field
                id="delivery-notes"
                label="Indicaciones (opcional)"
                className="sm:col-span-2"
              >
                <textarea
                  id="delivery-notes"
                  rows={3}
                  className="border-line bg-surface text-foreground focus:border-brand min-h-24 w-full rounded-xl border px-3 py-2 text-sm outline-none"
                  {...register("address.deliveryNotes")}
                />
              </Field>
            </div>
          )}
        </section>

        <section className="border-line bg-surface rounded-[1.5rem] border p-5 sm:p-6">
          <h2
            id="payment-method-title"
            className="font-display text-foreground text-xl font-bold"
          >
            Forma de pago
          </h2>
          <p className="text-muted mt-2 text-sm leading-6">
            Todos los pagos se verifican manualmente antes de confirmar el
            pedido.
          </p>
          <div
            role="radiogroup"
            aria-labelledby="payment-method-title"
            className="mt-5 grid gap-3 sm:grid-cols-2"
          >
            {paymentMethods.map((method) => (
              <label
                key={method.code}
                className="border-line has-checked:border-brand has-checked:bg-brand-soft flex cursor-pointer gap-3 rounded-xl border p-4 transition"
              >
                <input
                  type="radio"
                  value={method.code}
                  className="accent-brand mt-1 size-4"
                  {...register("paymentMethod")}
                />
                <span>
                  <span className="text-foreground font-semibold">
                    {method.name}
                  </span>
                  <span className="text-muted mt-1 block text-sm leading-5">
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
          {paymentMethods.length === 0 ? (
            <p className="mt-4 rounded-xl bg-amber-50 p-4 text-sm text-amber-900">
              No hay métodos de pago disponibles. Escríbenos antes de continuar.
            </p>
          ) : null}
        </section>

        <section className="border-line bg-surface rounded-[1.5rem] border p-5 sm:p-6">
          <label className="text-foreground flex items-start gap-3 text-sm leading-6">
            <input
              aria-invalid={Boolean(errors.acceptedTerms)}
              aria-describedby={
                errors.acceptedTerms ? "accepted-terms-error" : undefined
              }
              type="checkbox"
              className="accent-brand mt-1 size-4 shrink-0"
              {...register("acceptedTerms")}
            />
            <span>
              Acepto los{" "}
              <Link
                href="/terminos-y-condiciones"
                target="_blank"
                className="text-brand-dark font-semibold hover:underline"
              >
                términos y condiciones
              </Link>{" "}
              y la{" "}
              <Link
                href="/politica-de-privacidad"
                target="_blank"
                className="text-brand-dark font-semibold hover:underline"
              >
                política de tratamiento de datos
              </Link>
              .
            </span>
          </label>
          {errors.acceptedTerms ? (
            <p
              id="accepted-terms-error"
              role="alert"
              className="mt-2 text-sm text-red-700"
            >
              {errors.acceptedTerms.message}
            </p>
          ) : null}
        </section>
      </div>

      <aside className="bg-foreground rounded-[1.5rem] p-6 text-white lg:sticky lg:top-32">
        <h2 className="text-lg font-bold">Revisión segura</h2>
        <p className="mt-2 text-sm leading-6 text-slate-300">
          Validaremos precios, disponibilidad y envío directamente en el
          servidor.
        </p>
        <div className="mt-5 space-y-3 border-t border-white/15 pt-5 text-sm">
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
            aria-live="assertive"
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
              {isCreatingOrder ? "Confirmando pedido…" : "Confirmar pedido"}
            </button>
          </div>
        )}

        <button
          type="submit"
          disabled={
            isSubmitting ||
            paymentMethods.length === 0 ||
            shippingMethods.length === 0
          }
          className="bg-brand text-foreground mt-6 h-12 w-full rounded-full text-sm font-bold transition hover:bg-white disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-300"
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
  id: string;
  label: string;
};

function Field({ children, className = "", error, id, label }: FieldProps) {
  return (
    <label
      htmlFor={id}
      className={`text-foreground grid min-w-0 gap-1.5 text-sm font-semibold ${className}`}
    >
      {label}
      {children}
      {error && (
        <span id={`${id}-error`} role="alert" className="text-xs text-red-700">
          {error}
        </span>
      )}
    </label>
  );
}
