import { describe, expect, it, vi } from "vitest";

import { createCatalogService } from "./catalog-service";

function createRepository() {
  return {
    findProductBySlug: vi.fn().mockResolvedValue(null),
    listProducts: vi.fn().mockResolvedValue({
      items: [],
      page: 1,
      pageSize: 12,
      totalItems: 0,
      totalPages: 0,
    }),
  };
}

describe("catalogService", () => {
  it("validates and normalizes filters before querying", async () => {
    const repository = createRepository();
    const service = createCatalogService(repository);

    await service.listProducts({ category: "Cables-USB", page: "2" });

    expect(repository.listProducts).toHaveBeenCalledWith({
      category: "cables-usb",
      page: 2,
      pageSize: 12,
      sort: "featured",
    });
  });

  it("does not query when filters are invalid", () => {
    const repository = createRepository();
    const service = createCatalogService(repository);

    expect(() => service.listProducts({ pageSize: 200 })).toThrow();
    expect(repository.listProducts).not.toHaveBeenCalled();
  });

  it("normalizes a product slug before querying", async () => {
    const repository = createRepository();
    const service = createCatalogService(repository);

    await service.getProductBySlug(" Cable-Lightning ");

    expect(repository.findProductBySlug).toHaveBeenCalledWith(
      "cable-lightning",
    );
  });
});
