export type CartLine = {
  availableQuantity: number;
  quantity: number;
  unitPriceInCop: number;
};

export function clampCartQuantity(
  requestedQuantity: number,
  availableQuantity: number,
): number {
  if (!Number.isSafeInteger(availableQuantity) || availableQuantity < 1) {
    throw new Error("Available quantity must be a positive integer");
  }

  if (!Number.isSafeInteger(requestedQuantity)) {
    throw new Error("Cart quantity must be an integer");
  }

  return Math.min(Math.max(requestedQuantity, 1), availableQuantity);
}

export function calculateCartTotal(lines: CartLine[]): number {
  return lines.reduce((total, line) => {
    if (
      !Number.isSafeInteger(line.unitPriceInCop) ||
      line.unitPriceInCop < 0 ||
      !Number.isSafeInteger(line.quantity) ||
      line.quantity < 1
    ) {
      throw new Error("Cart line contains invalid monetary or quantity values");
    }

    const lineTotal = line.unitPriceInCop * line.quantity;
    const nextTotal = total + lineTotal;

    if (!Number.isSafeInteger(nextTotal)) {
      throw new Error("Cart total exceeds the supported integer range");
    }

    return nextTotal;
  }, 0);
}

export function countCartItems(lines: Pick<CartLine, "quantity">[]): number {
  return lines.reduce((total, line) => total + line.quantity, 0);
}
