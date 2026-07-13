import { z } from "zod";

const optionalSearch = z
  .string()
  .trim()
  .max(100)
  .optional()
  .transform((value) => value || undefined);

const optionalSlug = z
  .string()
  .trim()
  .toLowerCase()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
  .max(140)
  .optional()
  .transform((value) => value || undefined);

export const catalogFiltersSchema = z
  .object({
    category: optionalSlug,
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(48).default(12),
    search: optionalSearch,
    sort: z
      .enum(["featured", "newest", "price-asc", "price-desc"])
      .default("featured"),
  })
  .strict();

export const productSlugSchema = z
  .string()
  .trim()
  .toLowerCase()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
  .max(200);

export type CatalogFilters = z.infer<typeof catalogFiltersSchema>;
