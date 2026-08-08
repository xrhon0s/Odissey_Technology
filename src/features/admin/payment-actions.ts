import type { ManualPaymentMethod } from "@/features/payments/payment-methods";

export type AdminPaymentAction =
  | "approve_transfer"
  | "confirm_cash_on_delivery"
  | "decline_order"
  | "record_cash_received";

type PaymentActionState = {
  action: AdminPaymentAction;
  isReservationExpired: boolean;
  orderStatus:
    | "pending"
    | "confirmed"
    | "preparing"
    | "shipped"
    | "delivered"
    | "cancelled";
  paymentMethod: ManualPaymentMethod;
  paymentStatus: "pending" | "approved" | "declined" | "voided" | "refunded";
};

export type PaymentActionPlan = {
  eventType: string;
  inventoryEffect: "commit_reservation" | "none" | "release_reservation";
  nextOrderStatus?: "cancelled" | "confirmed";
  nextPaymentStatus?: "approved" | "declined";
};

export class InvalidPaymentActionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidPaymentActionError";
  }
}

export function planAdminPaymentAction(
  state: PaymentActionState,
): PaymentActionPlan {
  const isCash = state.paymentMethod === "cash_on_delivery";

  if (state.action === "record_cash_received") {
    if (
      !isCash ||
      state.paymentStatus !== "pending" ||
      !["confirmed", "preparing", "shipped", "delivered"].includes(
        state.orderStatus,
      )
    ) {
      throw new InvalidPaymentActionError(
        "Solo se puede registrar efectivo pendiente para un pedido contraentrega confirmado.",
      );
    }

    return {
      eventType: "cash_received",
      inventoryEffect: "none",
      nextPaymentStatus: "approved",
    };
  }

  if (state.orderStatus !== "pending" || state.paymentStatus !== "pending") {
    throw new InvalidPaymentActionError(
      "El pedido o el pago ya fueron procesados.",
    );
  }

  if (state.action === "decline_order") {
    return {
      eventType: "declined_by_admin",
      inventoryEffect: "release_reservation",
      nextOrderStatus: "cancelled",
      nextPaymentStatus: "declined",
    };
  }

  if (state.isReservationExpired) {
    throw new InvalidPaymentActionError(
      "La reserva de inventario ya venció; el pedido debe cancelarse.",
    );
  }

  if (state.action === "confirm_cash_on_delivery") {
    if (!isCash) {
      throw new InvalidPaymentActionError(
        "Esta acción solo corresponde a pedidos contraentrega.",
      );
    }

    return {
      eventType: "cash_order_confirmed",
      inventoryEffect: "commit_reservation",
      nextOrderStatus: "confirmed",
    };
  }

  if (isCash) {
    throw new InvalidPaymentActionError(
      "El efectivo se registra después de confirmar la contraentrega.",
    );
  }

  return {
    eventType: "approved_by_admin",
    inventoryEffect: "commit_reservation",
    nextOrderStatus: "confirmed",
    nextPaymentStatus: "approved",
  };
}
