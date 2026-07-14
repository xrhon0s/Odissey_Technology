import { and, eq, inArray, sql } from "drizzle-orm";

import { getDb } from "@/db";
import {
  adminUsers,
  inventory,
  inventoryMovements,
  orderItems,
  orders,
  paymentEvents,
  payments,
} from "@/db/schema";
import { manualPaymentMethodSchema } from "@/features/payments/payment-methods";

import {
  type AdminPaymentAction,
  InvalidPaymentActionError,
  planAdminPaymentAction,
} from "./payment-actions";

type ManageOrderPaymentInput = {
  action: AdminPaymentAction;
  actorAdminId: string;
  paymentId: string;
  reviewNotes?: string;
};

export type ManageOrderPaymentResult = {
  orderId: string;
  orderStatus: string;
  paymentId: string;
  paymentStatus: string;
};

export class AdminOrderManagementError extends Error {
  constructor(
    public readonly code:
      "ADMIN_FORBIDDEN" | "INVENTORY_CONFLICT" | "PAYMENT_NOT_FOUND",
    message: string,
  ) {
    super(message);
    this.name = "AdminOrderManagementError";
  }
}

export async function manageOrderPayment(
  input: ManageOrderPaymentInput,
): Promise<ManageOrderPaymentResult> {
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
      throw new AdminOrderManagementError(
        "ADMIN_FORBIDDEN",
        "El administrador no está autorizado.",
      );
    }

    const [paymentReference] = await transaction
      .select({ orderId: payments.orderId })
      .from(payments)
      .where(eq(payments.id, input.paymentId))
      .limit(1);

    if (!paymentReference) {
      throw new AdminOrderManagementError(
        "PAYMENT_NOT_FOUND",
        "El pago no existe.",
      );
    }

    const [order] = await transaction
      .select({
        id: orders.id,
        reference: orders.reference,
        reservationExpiresAt: orders.reservationExpiresAt,
        status: orders.status,
      })
      .from(orders)
      .where(eq(orders.id, paymentReference.orderId))
      .for("update")
      .limit(1);

    if (!order) {
      throw new AdminOrderManagementError(
        "PAYMENT_NOT_FOUND",
        "El pedido asociado no existe.",
      );
    }

    const [payment] = await transaction
      .select({
        id: payments.id,
        method: payments.method,
        orderId: payments.orderId,
        status: payments.status,
      })
      .from(payments)
      .where(
        and(eq(payments.id, input.paymentId), eq(payments.orderId, order.id)),
      )
      .for("update")
      .limit(1);

    if (!payment) {
      throw new AdminOrderManagementError(
        "PAYMENT_NOT_FOUND",
        "El pago no existe.",
      );
    }

    const parsedPaymentMethod = manualPaymentMethodSchema.safeParse(
      payment.method,
    );

    if (!parsedPaymentMethod.success) {
      throw new InvalidPaymentActionError(
        "El método de pago legado debe migrarse antes de procesarlo.",
      );
    }

    const plan = planAdminPaymentAction({
      action: input.action,
      isReservationExpired: order.reservationExpiresAt <= new Date(),
      orderStatus: order.status,
      paymentMethod: parsedPaymentMethod.data,
      paymentStatus: payment.status,
    });
    const items = await transaction
      .select({
        quantity: orderItems.quantity,
        variantId: orderItems.variantId,
      })
      .from(orderItems)
      .where(eq(orderItems.orderId, order.id));

    if (plan.inventoryEffect !== "none") {
      const variantIds = items.map((item) => item.variantId);
      const inventoryRows = await transaction
        .select({
          quantity: inventory.quantity,
          reservedQuantity: inventory.reservedQuantity,
          variantId: inventory.variantId,
        })
        .from(inventory)
        .where(inArray(inventory.variantId, variantIds))
        .for("update");
      const inventoryByVariant = new Map(
        inventoryRows.map((row) => [row.variantId, row]),
      );

      for (const item of items) {
        const currentInventory = inventoryByVariant.get(item.variantId);

        if (
          !currentInventory ||
          currentInventory.reservedQuantity < item.quantity ||
          (plan.inventoryEffect === "commit_reservation" &&
            currentInventory.quantity < item.quantity)
        ) {
          throw new AdminOrderManagementError(
            "INVENTORY_CONFLICT",
            "La reserva de inventario no coincide con el pedido.",
          );
        }

        const [updatedInventory] = await transaction
          .update(inventory)
          .set({
            quantity:
              plan.inventoryEffect === "commit_reservation"
                ? sql`${inventory.quantity} - ${item.quantity}`
                : inventory.quantity,
            reservedQuantity: sql`${inventory.reservedQuantity} - ${item.quantity}`,
            updatedAt: new Date(),
          })
          .where(eq(inventory.variantId, item.variantId))
          .returning({ quantity: inventory.quantity });

        if (!updatedInventory) {
          throw new AdminOrderManagementError(
            "INVENTORY_CONFLICT",
            "No fue posible actualizar el inventario.",
          );
        }

        if (plan.inventoryEffect === "commit_reservation") {
          await transaction.insert(inventoryMovements).values({
            actorAdminId: admin.id,
            quantityDelta: -item.quantity,
            reason: `Pedido ${order.reference} confirmado`,
            referenceId: order.id,
            referenceType: "order",
            resultingQuantity: updatedInventory.quantity,
            type: "sale",
            variantId: item.variantId,
          });
        }
      }
    }

    const now = new Date();
    let nextOrderStatus = order.status;
    let nextPaymentStatus = payment.status;

    if (plan.nextOrderStatus) {
      nextOrderStatus = plan.nextOrderStatus;
      await transaction
        .update(orders)
        .set({ status: plan.nextOrderStatus, updatedAt: now })
        .where(eq(orders.id, order.id));
    }

    if (plan.nextPaymentStatus) {
      nextPaymentStatus = plan.nextPaymentStatus;
      await transaction
        .update(payments)
        .set({
          approvedAt: plan.nextPaymentStatus === "approved" ? now : null,
          reviewNotes: input.reviewNotes,
          status: plan.nextPaymentStatus,
          updatedAt: now,
        })
        .where(eq(payments.id, payment.id));
    }

    await transaction.insert(paymentEvents).values({
      actorAdminId: admin.id,
      eventType: plan.eventType,
      paymentId: payment.id,
      payload: {
        action: input.action,
        orderStatus: nextOrderStatus,
        paymentStatus: nextPaymentStatus,
      },
    });

    return {
      orderId: order.id,
      orderStatus: nextOrderStatus,
      paymentId: payment.id,
      paymentStatus: nextPaymentStatus,
    };
  });
}
