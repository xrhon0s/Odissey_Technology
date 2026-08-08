"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import {
  AdjustInventoryError,
  adjustInventory,
} from "@/features/admin/adjust-inventory";
import { requireAdmin } from "@/features/admin/admin-access";

const adjustmentSchema = z.object({
  reason: z.string().trim().min(5).max(300),
  targetQuantity: z.coerce.number().int().min(0).max(1_000_000),
  variantId: z.uuid(),
});

export type InventoryAdjustmentState = {
  error?: string;
  success?: string;
};

export async function adjustInventoryAction(
  _previousState: InventoryAdjustmentState,
  formData: FormData,
): Promise<InventoryAdjustmentState> {
  const admin = await requireAdmin();
  const input = adjustmentSchema.safeParse({
    reason: formData.get("reason"),
    targetQuantity: formData.get("targetQuantity"),
    variantId: formData.get("variantId"),
  });

  if (!input.success) {
    return { error: "Revisa la cantidad y escribe un motivo claro." };
  }

  try {
    await adjustInventory({ ...input.data, actorAdminId: admin.id });
    revalidatePath("/admin");
    revalidatePath("/admin/inventario");

    return { success: "Inventario actualizado y movimiento registrado." };
  } catch (error) {
    return {
      error:
        error instanceof AdjustInventoryError
          ? error.message
          : "No fue posible actualizar el inventario.",
    };
  }
}
