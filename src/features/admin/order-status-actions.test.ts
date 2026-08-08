import { describe, expect, it } from "vitest";

import {
  InvalidOrderStatusTransitionError,
  planNextOrderStatus,
} from "./order-status-actions";

describe("planNextOrderStatus", () => {
  it.each([
    ["confirmed", "preparing"],
    ["preparing", "shipped"],
    ["shipped", "delivered"],
  ])("advances %s to %s", (current, expected) => {
    expect(planNextOrderStatus(current, "approved")).toBe(expected);
  });

  it("requires payment before delivery", () => {
    expect(() => planNextOrderStatus("shipped", "pending")).toThrow(
      InvalidOrderStatusTransitionError,
    );
  });

  it.each(["pending", "cancelled", "delivered"])(
    "rejects advancement from %s",
    (status) => {
      expect(() => planNextOrderStatus(status, "approved")).toThrow(
        InvalidOrderStatusTransitionError,
      );
    },
  );
});
