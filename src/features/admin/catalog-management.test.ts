import { describe, expect, it } from "vitest";

import {
  createProductInputSchema,
  variantInputSchema,
} from "./catalog-management";

const validVariant = {
  compareAtPriceInCop: "69900",
  initialQuantity: "10",
  isActive: true,
  lowStockThreshold: "3",
  name: "20W",
  priceInCop: "59900",
  sku: "CARGADOR-20W",
};

describe("variantInputSchema", () => {
  it("convierte los valores del formulario", () => {
    expect(variantInputSchema.parse(validVariant)).toMatchObject({
      compareAtPriceInCop: 69900,
      initialQuantity: 10,
      priceInCop: 59900,
    });
  });

  it("rechaza un precio anterior menor o igual al actual", () => {
    expect(
      variantInputSchema.safeParse({
        ...validVariant,
        compareAtPriceInCop: "50000",
      }).success,
    ).toBe(false);
  });

  it("acepta un precio anterior vacío", () => {
    expect(
      variantInputSchema.parse({ ...validVariant, compareAtPriceInCop: "" })
        .compareAtPriceInCop,
    ).toBeNull();
  });
});

describe("createProductInputSchema", () => {
  it("requiere una descripción útil y una categoría válida", () => {
    const result = createProductInputSchema.safeParse({
      categoryId: "no-es-uuid",
      compatibility: "",
      description: "corta",
      isFeatured: false,
      name: "Producto",
      slug: "producto",
      status: "draft",
      variant: validVariant,
      warranty: "",
    });

    expect(result.success).toBe(false);
  });
});
