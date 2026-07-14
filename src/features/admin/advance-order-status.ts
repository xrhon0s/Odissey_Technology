import { and, eq } from "drizzle-orm";

import { getDb } from "@/db";
import { adminUsers, orderEvents, orders, payments } from "@/db/schema";

import { planNextOrderStatus } from "./order-status-actions";

type AdvanceOrderStatusInput = {
  actorAdminId: string;
  orderId: string;
};

export class AdvanceOrderStatusError extends Error {
  constructor(
    public readonly code: "ADMIN_FORBIDDEN" | "ORDER_NOT_FOUND",
    message: string,
  ) {
    super(message);
    this.name = "AdvanceOrderStatusError";
  }
}

export async function advanceOrderStatus(input: AdvanceOrderStatusInput) {
  return getDb().transaction(async (transaction) => {
    const [admin] = await transaction
      .select({ id: adminUsers.id })
      .from(adminUsers)
      .where(
        and(
          eq(adminUsers.id, input.actorAdminId),
          eq(adminUsers.isActive, true),
        ),
      )
      .limit(1);

    if (!admin) {
      throw new AdvanceOrderStatusError(
        "ADMIN_FORBIDDEN",
        "El administrador no está autorizado.",
      );
    }

    const [order] = await transaction
      .select({ id: orders.id, status: orders.status })
      .from(orders)
      .where(eq(orders.id, input.orderId))
      .for("update")
      .limit(1);

    if (!order) {
      throw new AdvanceOrderStatusError(
        "ORDER_NOT_FOUND",
        "El pedido no existe.",
      );
    }

    const [payment] = await transaction
      .select({ status: payments.status })
      .from(payments)
      .where(eq(payments.orderId, order.id))
      .for("update")
      .limit(1);

    if (!payment) {
      throw new AdvanceOrderStatusError(
        "ORDER_NOT_FOUND",
        "El pedido no tiene un pago asociado.",
      );
    }

    const nextStatus = planNextOrderStatus(order.status, payment.status);
    const now = new Date();

    await transaction
      .update(orders)
      .set({ status: nextStatus, updatedAt: now })
      .where(eq(orders.id, order.id));
    await transaction.insert(orderEvents).values({
      actorAdminId: admin.id,
      eventType: "status_advanced",
      fromStatus: order.status,
      orderId: order.id,
      toStatus: nextStatus,
    });

    return { orderId: order.id, status: nextStatus };
  });
}
