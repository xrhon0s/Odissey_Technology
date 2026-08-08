"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireAdmin } from "@/features/admin/admin-access";
import {
  AdminOrderManagementError,
  manageOrderPayment,
} from "@/features/admin/manage-order-payment";
import {
  InvalidPaymentActionError,
  type AdminPaymentAction,
} from "@/features/admin/payment-actions";
import { notifyOrderStatus } from "@/features/notifications/order-notifications";
import { getPublicStoreSettings } from "@/db/queries/store-settings";

const actionSchema = z.object({
  action: z.enum([
    "approve_transfer",
    "confirm_cash_on_delivery",
    "decline_order",
    "record_cash_received",
  ] satisfies AdminPaymentAction[]),
  paymentId: z.uuid(),
});

export type ManagePaymentState = {
  error?: string;
  success?: string;
};

export async function managePaymentAction(
  _previousState: ManagePaymentState,
  formData: FormData,
): Promise<ManagePaymentState> {
  const admin = await requireAdmin();
  const input = actionSchema.safeParse({
    action: formData.get("action"),
    paymentId: formData.get("paymentId"),
  });

  if (!input.success) return { error: "La acción solicitada no es válida." };

  try {
    const result = await manageOrderPayment({
      ...input.data,
      actorAdminId: admin.id,
    });
    const notificationStatus = {
      approve_transfer: "confirmed",
      confirm_cash_on_delivery: "confirmed",
      decline_order: "cancelled",
      record_cash_received: null,
    }[input.data.action] as "cancelled" | "confirmed" | null;

    if (notificationStatus) {
      try {
        await notifyOrderStatus({
          customerEmail: result.customerEmail,
          customerName: result.customerName,
          orderId: result.orderId,
          reference: result.reference,
          settings: await getPublicStoreSettings(),
          status: notificationStatus,
          totalInCop: result.totalInCop,
        });
      } catch {
        // El cambio administrativo ya fue aplicado y no depende del correo.
      }
    }
    revalidatePath("/admin");

    return { success: "Pedido actualizado correctamente." };
  } catch (error) {
    if (
      error instanceof AdminOrderManagementError ||
      error instanceof InvalidPaymentActionError
    ) {
      return { error: error.message };
    }

    return { error: "No fue posible actualizar el pedido." };
  }
}
