export type InventoryMovementKind =
  "purchase" | "sale" | "return" | "adjustment" | "cancellation";

type InventoryMovementInput = {
  currentQuantity: number;
  quantityDelta: number;
  type: InventoryMovementKind;
};

export type PlannedInventoryMovement = InventoryMovementInput & {
  resultingQuantity: number;
};

export function planInventoryMovement(
  input: InventoryMovementInput,
): PlannedInventoryMovement {
  if (
    !Number.isSafeInteger(input.currentQuantity) ||
    input.currentQuantity < 0
  ) {
    throw new Error("Current inventory must be a non-negative integer");
  }

  if (!Number.isSafeInteger(input.quantityDelta) || input.quantityDelta === 0) {
    throw new Error("Inventory movement must be a non-zero integer");
  }

  const resultingQuantity = input.currentQuantity + input.quantityDelta;

  if (resultingQuantity < 0) {
    throw new Error("Inventory movement cannot result in negative stock");
  }

  return { ...input, resultingQuantity };
}
