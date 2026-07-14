import { describe, expect, it } from "vitest";

import {
  calculateCartTotal,
  clampCartQuantity,
  countCartItems,
} from "./cart-rules";

describe("clampCartQuantity", () => {
  it("keeps quantities inside the purchasable range", () => {
    expect(clampCartQuantity(0, 5)).toBe(1);
    expect(clampCartQuantity(3, 5)).toBe(3);
    expect(clampCartQuantity(8, 5)).toBe(5);
  });

  it("rejects unavailable variants", () => {
    expect(() => clampCartQuantity(1, 0)).toThrow(
      "Available quantity must be a positive integer",
    );
  });
});

describe("calculateCartTotal", () => {
  it("calculates totals using integer COP values", () => {
    expect(
      calculateCartTotal([
        { availableQuantity: 10, quantity: 2, unitPriceInCop: 59900 },
        { availableQuantity: 4, quantity: 1, unitPriceInCop: 29900 },
      ]),
    ).toBe(149700);
  });

  it("rejects invalid monetary values", () => {
    expect(() =>
      calculateCartTotal([
        { availableQuantity: 1, quantity: 1, unitPriceInCop: 19.99 },
      ]),
    ).toThrow("Cart line contains invalid monetary or quantity values");
  });
});

describe("countCartItems", () => {
  it("counts units instead of distinct variants", () => {
    expect(countCartItems([{ quantity: 2 }, { quantity: 3 }])).toBe(5);
  });
});
