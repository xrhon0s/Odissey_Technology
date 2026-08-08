"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import {
  AdvanceOrderStatusError,
  advanceOrderStatus,
} from "@/features/admin/advance-order-status";
import { requireAdmin } from "@/features/admin/admin-access";
import { InvalidOrderStatusTransitionError } from "@/features/admin/order-status-actions";
import { shipmentInputSchema } from "@/features/orders/shipment";
import { notifyOrderStatus } from "@/features/notifications/order-notifications";
import { getPublicStoreSettings } from "@/db/queries/store-settings";

const orderIdSchema = z.uuid();

export type AdvanceOrderState = { error?: string; success?: string };

export async function advanceOrderAction(
  _previousState: AdvanceOrderState,
  formData: FormData,
): Promise<AdvanceOrderState> {
  const admin = await requireAdmin();
  const orderId = orderIdSchema.safeParse(formData.get("orderId"));

  if (!orderId.success) return { error: "El pedido no es válido." };

  const hasShipment = formData.get("shipmentForm") === "1";
  const shipment = hasShipment
    ? shipmentInputSchema.safeParse({
        carrier: formData.get("carrier"),
        estimatedDeliveryAt: formData.get("estimatedDeliveryAt"),
        trackingNumber: formData.get("trackingNumber"),
        trackingUrl: formData.get("trackingUrl"),
      })
    : null;

  if (shipment && !shipment.success) {
    return {
      error:
        shipment.error.issues[0]?.message ?? "Revisa los datos del despacho.",
    };
  }

  try {
    const result = await advanceOrderStatus({
      actorAdminId: admin.id,
      orderId: orderId.data,
      shipment: shipment?.data,
    });
    try {
      await notifyOrderStatus({
        customerEmail: result.customerEmail,
        customerName: result.customerName,
        estimatedDeliveryAt: result.estimatedDeliveryAt,
        orderId: result.orderId,
        reference: result.reference,
        settings: await getPublicStoreSettings(),
        shippingCarrier: result.shippingCarrier,
        status: result.status,
        totalInCop: result.totalInCop,
        trackingNumber: result.trackingNumber,
        trackingUrl: result.trackingUrl,
      });
    } catch {
      // El despacho y su seguimiento no dependen del proveedor de correo.
    }
    revalidatePath("/admin");
    revalidatePath(`/admin/pedidos/${orderId.data}`);

    return { success: "Estado actualizado correctamente." };
  } catch (error) {
    if (
      error instanceof AdvanceOrderStatusError ||
      error instanceof InvalidOrderStatusTransitionError
    ) {
      return { error: error.message };
    }

    return { error: "No fue posible actualizar el estado." };
  }
}
