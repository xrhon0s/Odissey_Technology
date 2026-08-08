"use client";

import { useActionState } from "react";

import {
  managePaymentAction,
  type ManagePaymentState,
} from "@/app/admin/pedidos/actions";
import type { AdminPaymentAction } from "@/features/admin/payment-actions";

const initialState: ManagePaymentState = {};

type OrderActionButtonProps = {
  action: AdminPaymentAction;
  label: string;
  paymentId: string;
  tone?: "danger" | "primary" | "secondary";
};

export function OrderActionButton({
  action,
  label,
  paymentId,
  tone = "secondary",
}: OrderActionButtonProps) {
  const [state, formAction, isPending] = useActionState(
    managePaymentAction,
    initialState,
  );
  const toneClass = {
    danger: "border-red-300 text-red-800 hover:bg-red-50",
    primary:
      "border-brand bg-brand text-foreground hover:border-white hover:bg-white",
    secondary:
      "border-line text-foreground hover:border-brand hover:bg-brand/5",
  }[tone];

  return (
    <form action={formAction} className="min-w-36">
      <input type="hidden" name="action" value={action} />
      <input type="hidden" name="paymentId" value={paymentId} />
      <button
        type="submit"
        disabled={isPending}
        className={`h-10 w-full rounded-xl border px-3 text-xs font-extrabold transition disabled:cursor-not-allowed disabled:opacity-50 ${toneClass}`}
      >
        {isPending ? "Procesando…" : label}
      </button>
      {(state.error || state.success) && (
        <p
          role="status"
          className={`mt-2 text-xs ${state.error ? "text-red-700" : "text-emerald-700"}`}
        >
          {state.error ?? state.success}
        </p>
      )}
    </form>
  );
}
