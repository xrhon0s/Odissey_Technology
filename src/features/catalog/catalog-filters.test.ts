import { describe, expect, it } from "vitest";

import { catalogFiltersSchema, productSlugSchema } from "./catalog-filters";

describe("catalogFiltersSchema", () => {
  it("provides bounded catalog defaults", () => {
    expect(catalogFiltersSchema.parse({})).toEqual({
      page: 1,
      pageSize: 12,
      sort: "featured",
    });
  });

  it("coerces URL values and normalizes text", () => {
    expect(
      catalogFiltersSchema.parse({
        category: "Audifonos-Bluetooth",
        page: "2",
        pageSize: "24",
        search: "  iPhone  ",
        sort: "price-asc",
      }),
    ).toEqual({
      category: "audifonos-bluetooth",
      page: 2,
      pageSize: 24,
      search: "iPhone",
      sort: "price-asc",
    });
  });

  it("rejects excessive page sizes", () => {
    expect(() => catalogFiltersSchema.parse({ pageSize: "100" })).toThrow();
  });

  it("rejects unknown filters", () => {
    expect(() => catalogFiltersSchema.parse({ admin: "true" })).toThrow();
  });
});

describe("productSlugSchema", () => {
  it("normalizes a public product slug", () => {
    expect(productSlugSchema.parse("  Cargador-USB-C-20W ")).toBe(
      "cargador-usb-c-20w",
    );
  });

  it("rejects unsafe path content", () => {
    expect(() => productSlugSchema.parse("../../admin")).toThrow();
  });
});
