export type FulfillmentOrderStatus =
  "confirmed" | "delivered" | "preparing" | "shipped";

const nextStatusByCurrent: Record<
  Exclude<FulfillmentOrderStatus, "delivered">,
  FulfillmentOrderStatus
> = {
  confirmed: "preparing",
  preparing: "shipped",
  shipped: "delivered",
};

export class InvalidOrderStatusTransitionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidOrderStatusTransitionError";
  }
}

export function planNextOrderStatus(
  currentStatus: string,
  paymentStatus: string,
): FulfillmentOrderStatus {
  if (currentStatus === "delivered") {
    throw new InvalidOrderStatusTransitionError("El pedido ya fue entregado.");
  }

  if (!(currentStatus in nextStatusByCurrent)) {
    throw new InvalidOrderStatusTransitionError(
      "El pedido debe estar confirmado antes de avanzar su entrega.",
    );
  }

  const nextStatus =
    nextStatusByCurrent[
      currentStatus as Exclude<FulfillmentOrderStatus, "delivered">
    ];

  if (nextStatus === "delivered" && paymentStatus !== "approved") {
    throw new InvalidOrderStatusTransitionError(
      "Registra el pago antes de marcar el pedido como entregado.",
    );
  }

  return nextStatus;
}
