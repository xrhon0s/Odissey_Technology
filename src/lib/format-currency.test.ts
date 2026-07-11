import { describe, expect, it } from "vitest";

import { formatCurrency } from "./format-currency";

describe("formatCurrency", () => {
  it("formats whole Colombian pesos without decimals", () => {
    expect(formatCurrency(129900)).toMatch(/^\$\s?129\.900$/);
  });
});
