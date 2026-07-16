"use client";

import Image from "next/image";
import { useState } from "react";

import type { PaymentInstructionsData } from "@/features/payments/payment-methods";
import { formatCurrency } from "@/lib/format-currency";

type PaymentInstructionsProps = {
  instructions: PaymentInstructionsData;
  reference: string;
  totalInCop: number;
};

export function PaymentInstructions({
  instructions,
  reference,
  totalInCop,
}: PaymentInstructionsProps) {
  const [copiedValue, setCopiedValue] = useState<string | null>(null);

  async function copy(value: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedValue(value);
      window.setTimeout(() => setCopiedValue(null), 1800);
    } catch {
      setCopiedValue(null);
    }
  }

  return (
    <section className="border-line bg-background mt-6 overflow-hidden rounded-2xl border text-left">
      <div className="bg-foreground px-5 py-5 text-white sm:px-6">
        <p className="text-brand text-xs font-bold tracking-[0.16em] uppercase">
          Instrucciones de pago
        </p>
        <h3 className="font-display mt-1 text-2xl font-bold">
          {instructions.title}
        </h3>
        <p className="mt-2 text-sm leading-6 text-slate-300">
          {instructions.message}
        </p>
      </div>

      <div
        className={`grid gap-6 p-5 sm:p-6 ${instructions.qrImage ? "md:grid-cols-[minmax(220px,0.8fr)_1fr]" : ""}`}
      >
        {instructions.qrImage ? (
          <div className="border-line rounded-2xl border bg-white p-3">
            <Image
              alt={instructions.qrImage.alt}
              className="mx-auto h-auto max-h-[430px] w-full object-contain"
              height={instructions.qrImage.height}
              priority
              sizes="(max-width: 768px) 100vw, 360px"
              src={instructions.qrImage.src}
              width={instructions.qrImage.width}
            />
          </div>
        ) : null}

        <div className="min-w-0">
          <dl className="space-y-3">
            <PaymentValue
              label="Valor exacto"
              value={formatCurrency(totalInCop)}
            />
            <PaymentValue label="Referencia del pedido" value={reference} />
            {instructions.details.map((detail) => (
              <PaymentValue
                copyable
                copied={copiedValue === detail.value}
                key={detail.label}
                label={detail.label}
                onCopy={() => copy(detail.value)}
                value={detail.value}
              />
            ))}
          </dl>
          <div className="mt-5 rounded-xl bg-amber-50 p-4 text-sm leading-6 text-amber-950">
            <p className="font-bold">Antes de enviar</p>
            <p className="mt-1">
              Verifica el destinatario y el valor. Después del pago, conserva el
              comprobante e indica la referencia <strong>{reference}</strong>.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

type PaymentValueProps = {
  copied?: boolean;
  copyable?: boolean;
  label: string;
  onCopy?: () => void;
  value: string;
};

function PaymentValue({
  copied = false,
  copyable = false,
  label,
  onCopy,
  value,
}: PaymentValueProps) {
  return (
    <div className="border-line bg-surface flex min-w-0 items-center justify-between gap-3 rounded-xl border p-3">
      <div className="min-w-0">
        <dt className="text-muted text-xs font-semibold">{label}</dt>
        <dd className="text-foreground mt-0.5 font-mono text-sm font-bold break-all">
          {value}
        </dd>
      </div>
      {copyable ? (
        <button
          className="border-line hover:border-brand hover:text-brand-dark shrink-0 rounded-full border px-3 py-1.5 text-xs font-bold transition"
          onClick={onCopy}
          type="button"
        >
          {copied ? "Copiado" : "Copiar"}
        </button>
      ) : null}
    </div>
  );
}
