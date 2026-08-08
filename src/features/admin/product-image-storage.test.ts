import { describe, expect, it } from "vitest";

import {
  MAX_PRODUCT_IMAGE_BYTES,
  ProductImageStorageError,
  validateProductImageFile,
} from "./product-image-storage";

describe("validateProductImageFile", () => {
  it("acepta formatos optimizados para web", () => {
    expect(
      validateProductImageFile({ size: 100_000, type: "image/webp" }),
    ).toEqual({ extension: "webp" });
  });

  it("rechaza archivos que no sean imágenes permitidas", () => {
    expect(() =>
      validateProductImageFile({ size: 100, type: "image/svg+xml" }),
    ).toThrow(ProductImageStorageError);
  });

  it("rechaza imágenes mayores de 3 MB", () => {
    expect(() =>
      validateProductImageFile({
        size: MAX_PRODUCT_IMAGE_BYTES + 1,
        type: "image/jpeg",
      }),
    ).toThrow("máximo 3 MB");
  });
});
