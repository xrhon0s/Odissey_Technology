import { and, eq } from "drizzle-orm";

import { getDb } from "@/db";
import { adminUsers, inventory, inventoryMovements } from "@/db/schema";
import { planInventoryMovement } from "@/features/inventory/plan-inventory-movement";

type AdjustInventoryInput = {
  actorAdminId: string;
  reason: string;
  targetQuantity: number;
  variantId: string;
};

type PlanInventoryAdjustmentInput = {
  currentQuantity: number;
  reservedQuantity: number;
  targetQuantity: number;
};

export class AdjustInventoryError extends Error {
  constructor(
    public readonly code:
      "ADMIN_FORBIDDEN" | "INVENTORY_NOT_FOUND" | "INVALID_QUANTITY",
    message: string,
  ) {
    super(message);
    this.name = "AdjustInventoryError";
  }
}

export function planInventoryAdjustment(input: PlanInventoryAdjustmentInput) {
  if (
    !Number.isSafeInteger(input.targetQuantity) ||
    input.targetQuantity < input.reservedQuantity
  ) {
    throw new AdjustInventoryError(
      "INVALID_QUANTITY",
      "La existencia total no puede ser menor que las unidades reservadas.",
    );
  }

  try {
    return planInventoryMovement({
      currentQuantity: input.currentQuantity,
      quantityDelta: input.targetQuantity - input.currentQuantity,
      type: "adjustment",
    });
  } catch {
    throw new AdjustInventoryError(
      "INVALID_QUANTITY",
      "La nueva cantidad debe ser diferente y no negativa.",
    );
  }
}

export async function adjustInventory(input: AdjustInventoryInput) {
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
      throw new AdjustInventoryError(
        "ADMIN_FORBIDDEN",
        "El administrador no está autorizado.",
      );
    }

    const [currentInventory] = await transaction
      .select({
        quantity: inventory.quantity,
        reservedQuantity: inventory.reservedQuantity,
        variantId: inventory.variantId,
      })
      .from(inventory)
      .where(eq(inventory.variantId, input.variantId))
      .for("update")
      .limit(1);

    if (!currentInventory) {
      throw new AdjustInventoryError(
        "INVENTORY_NOT_FOUND",
        "No existe inventario para esta variante.",
      );
    }

    const movement = planInventoryAdjustment({
      currentQuantity: currentInventory.quantity,
      reservedQuantity: currentInventory.reservedQuantity,
      targetQuantity: input.targetQuantity,
    });

    await transaction
      .update(inventory)
      .set({ quantity: movement.resultingQuantity, updatedAt: new Date() })
      .where(eq(inventory.variantId, currentInventory.variantId));
    await transaction.insert(inventoryMovements).values({
      actorAdminId: admin.id,
      quantityDelta: movement.quantityDelta,
      reason: input.reason,
      referenceId: currentInventory.variantId,
      referenceType: "manual_adjustment",
      resultingQuantity: movement.resultingQuantity,
      type: "adjustment",
      variantId: currentInventory.variantId,
    });

    return {
      quantity: movement.resultingQuantity,
      variantId: currentInventory.variantId,
    };
  });
}
