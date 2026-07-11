import { describe, expect, it } from "vitest";

import { planInventoryMovement } from "./plan-inventory-movement";

describe("planInventoryMovement", () => {
  it("calculates the auditable resulting quantity", () => {
    expect(
      planInventoryMovement({
        currentQuantity: 8,
        quantityDelta: -3,
        type: "sale",
      }),
    ).toEqual({
      currentQuantity: 8,
      quantityDelta: -3,
      resultingQuantity: 5,
      type: "sale",
    });
  });

  it("prevents negative inventory", () => {
    expect(() =>
      planInventoryMovement({
        currentQuantity: 2,
        quantityDelta: -3,
        type: "sale",
      }),
    ).toThrow("Inventory movement cannot result in negative stock");
  });

  it("rejects silent zero-quantity movements", () => {
    expect(() =>
      planInventoryMovement({
        currentQuantity: 2,
        quantityDelta: 0,
        type: "adjustment",
      }),
    ).toThrow("Inventory movement must be a non-zero integer");
  });
});
