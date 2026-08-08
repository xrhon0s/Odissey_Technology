import type { MetadataRoute } from "next";

import { catalogService } from "@/features/catalog/catalog-service";
import { absoluteSiteUrl } from "@/features/seo/site-url";

export const revalidate = 3600;

const staticPages: MetadataRoute.Sitemap = [
  { changeFrequency: "daily", priority: 1, url: absoluteSiteUrl("/") },
  {
    changeFrequency: "daily",
    priority: 0.9,
    url: absoluteSiteUrl("/catalogo"),
  },
  {
    changeFrequency: "monthly",
    priority: 0.4,
    url: absoluteSiteUrl("/envios-y-entregas"),
  },
  {
    changeFrequency: "monthly",
    priority: 0.4,
    url: absoluteSiteUrl("/cambios-garantias-y-retracto"),
  },
  {
    changeFrequency: "yearly",
    priority: 0.2,
    url: absoluteSiteUrl("/politica-de-privacidad"),
  },
  {
    changeFrequency: "yearly",
    priority: 0.2,
    url: absoluteSiteUrl("/terminos-y-condiciones"),
  },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [categories, products] = await Promise.all([
    catalogService.listCategories(),
    catalogService.listProductSeoEntries(),
  ]);

  return [
    ...staticPages,
    ...categories.map((category) => ({
      changeFrequency: "weekly" as const,
      lastModified: category.updatedAt,
      priority: 0.7,
      url: absoluteSiteUrl(`/categoria/${category.slug}`),
    })),
    ...products.map((product) => ({
      changeFrequency: "weekly" as const,
      images: product.imageUrl ? [product.imageUrl] : undefined,
      lastModified: product.updatedAt,
      priority: 0.8,
      url: absoluteSiteUrl(`/producto/${product.slug}`),
    })),
  ];
}
