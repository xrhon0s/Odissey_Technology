import { describe, expect, it } from "vitest";

import {
  AdjustInventoryError,
  planInventoryAdjustment,
} from "./adjust-inventory";

describe("planInventoryAdjustment", () => {
  it("plans an auditable stock increase", () => {
    expect(
      planInventoryAdjustment({
        currentQuantity: 5,
        reservedQuantity: 2,
        targetQuantity: 9,
      }),
    ).toMatchObject({ quantityDelta: 4, resultingQuantity: 9 });
  });

  it("rejects a total below reserved units", () => {
    expect(() =>
      planInventoryAdjustment({
        currentQuantity: 5,
        reservedQuantity: 3,
        targetQuantity: 2,
      }),
    ).toThrow(AdjustInventoryError);
  });

  it("rejects silent adjustments", () => {
    expect(() =>
      planInventoryAdjustment({
        currentQuantity: 5,
        reservedQuantity: 0,
        targetQuantity: 5,
      }),
    ).toThrow(AdjustInventoryError);
  });
});
