import { describe, expect, it } from "vitest";

import { adminOrderFiltersSchema } from "./admin-order-filters";

describe("adminOrderFiltersSchema", () => {
  it("keeps supported filters and trims the search", () => {
    expect(
      adminOrderFiltersSchema.parse({
        orderStatus: "preparing",
        paymentStatus: "approved",
        query: "  OD-123  ",
      }),
    ).toEqual({
      orderStatus: "preparing",
      paymentStatus: "approved",
      query: "OD-123",
    });
  });

  it("ignores unsupported statuses", () => {
    expect(
      adminOrderFiltersSchema.parse({ orderStatus: "unknown" }).orderStatus,
    ).toBeUndefined();
  });
});
