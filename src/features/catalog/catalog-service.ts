import {
  getActiveCategoryBySlug,
  getCatalogProductBySlug,
  listActiveCategories,
  listActiveProductSeoEntries,
  listCatalogProducts,
} from "@/db/queries/catalog";

import {
  catalogFiltersSchema,
  categorySlugSchema,
  productSlugSchema,
} from "./catalog-filters";

type CatalogRepository = {
  findCategoryBySlug: typeof getActiveCategoryBySlug;
  findProductBySlug: typeof getCatalogProductBySlug;
  listCategories: typeof listActiveCategories;
  listProductSeoEntries: typeof listActiveProductSeoEntries;
  listProducts: typeof listCatalogProducts;
};

export function createCatalogService(repository: CatalogRepository) {
  return {
    listCategories() {
      return repository.listCategories();
    },
    getCategoryBySlug(input: unknown) {
      const slug = categorySlugSchema.parse(input);
      return repository.findCategoryBySlug(slug);
    },
    getProductBySlug(input: unknown) {
      const slug = productSlugSchema.parse(input);
      return repository.findProductBySlug(slug);
    },
    listProducts(input: unknown) {
      const filters = catalogFiltersSchema.parse(input);
      return repository.listProducts(filters);
    },
    listProductSeoEntries() {
      return repository.listProductSeoEntries();
    },
  };
}

export const catalogService = createCatalogService({
  findCategoryBySlug: getActiveCategoryBySlug,
  findProductBySlug: getCatalogProductBySlug,
  listCategories: listActiveCategories,
  listProductSeoEntries: listActiveProductSeoEntries,
  listProducts: listCatalogProducts,
});
