import {
  getCatalogProductBySlug,
  listActiveCategories,
  listCatalogProducts,
} from "@/db/queries/catalog";

import { catalogFiltersSchema, productSlugSchema } from "./catalog-filters";

type CatalogRepository = {
  findProductBySlug: typeof getCatalogProductBySlug;
  listCategories: typeof listActiveCategories;
  listProducts: typeof listCatalogProducts;
};

export function createCatalogService(repository: CatalogRepository) {
  return {
    listCategories() {
      return repository.listCategories();
    },
    getProductBySlug(input: unknown) {
      const slug = productSlugSchema.parse(input);
      return repository.findProductBySlug(slug);
    },
    listProducts(input: unknown) {
      const filters = catalogFiltersSchema.parse(input);
      return repository.listProducts(filters);
    },
  };
}

export const catalogService = createCatalogService({
  findProductBySlug: getCatalogProductBySlug,
  listCategories: listActiveCategories,
  listProducts: listCatalogProducts,
});
