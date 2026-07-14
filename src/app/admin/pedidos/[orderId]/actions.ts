"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import {
  AdvanceOrderStatusError,
  advanceOrderStatus,
} from "@/features/admin/advance-order-status";
import { requireAdmin } from "@/features/admin/admin-access";
import { InvalidOrderStatusTransitionError } from "@/features/admin/order-status-actions";

const orderIdSchema = z.uuid();

export type AdvanceOrderState = { error?: string; success?: string };

export async function advanceOrderAction(
  _previousState: AdvanceOrderState,
  formData: FormData,
): Promise<AdvanceOrderState> {
  const admin = await requireAdmin();
  const orderId = orderIdSchema.safeParse(formData.get("orderId"));

  if (!orderId.success) return { error: "El pedido no es válido." };

  try {
    await advanceOrderStatus({ actorAdminId: admin.id, orderId: orderId.data });
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
