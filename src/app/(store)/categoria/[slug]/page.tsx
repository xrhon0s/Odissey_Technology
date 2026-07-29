import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import { z } from "zod";

import { CatalogPagination } from "@/components/products/catalog-pagination";
import { ProductCard } from "@/components/products/product-card";
import {
  categorySlugSchema,
  type CatalogFilters,
} from "@/features/catalog/catalog-filters";
import { catalogService } from "@/features/catalog/catalog-service";
import { JsonLd } from "@/features/seo/json-ld";
import { canonicalPath } from "@/features/seo/metadata";
import { buildCategoryStructuredData } from "@/features/seo/structured-data";

type CategoryPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
};

const pageSchema = z.coerce.number().int().min(1).catch(1);
const getCategory = cache((slug: string) =>
  catalogService.getCategoryBySlug(slug),
);

function categoryDescription(name: string, description: string | null) {
  return (
    description ??
    `Explora ${name.toLowerCase()} disponibles en Odissey Technology, con pagos flexibles y envíos a toda Colombia.`
  );
}

export async function generateMetadata({
  params,
  searchParams,
}: CategoryPageProps): Promise<Metadata> {
  const parsedSlug = categorySlugSchema.safeParse((await params).slug);
  if (!parsedSlug.success)
    return { robots: { index: false }, title: "Categoría" };

  const category = await getCategory(parsedSlug.data);
  if (!category) return { robots: { index: false }, title: "Categoría" };

  const page = pageSchema.parse((await searchParams).page);
  const canonical =
    page > 1
      ? `/categoria/${category.slug}?page=${page}`
      : `/categoria/${category.slug}`;
  const description = categoryDescription(category.name, category.description);

  return {
    alternates: canonicalPath(canonical),
    description,
    openGraph: {
      description,
      title: category.name,
      type: "website",
      url: canonical,
    },
    title: page > 1 ? `${category.name} — Página ${page}` : category.name,
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: CategoryPageProps) {
  const parsedSlug = categorySlugSchema.safeParse((await params).slug);
  if (!parsedSlug.success) notFound();

  const category = await getCategory(parsedSlug.data);
  if (!category) notFound();

  const page = pageSchema.parse((await searchParams).page);
  const filters: CatalogFilters = {
    category: category.slug,
    page,
    pageSize: 12,
    search: undefined,
    sort: "featured",
  };
  const catalog = await catalogService.listProducts(filters);
  if (catalog.totalPages > 0 && page > catalog.totalPages) notFound();

  const description = categoryDescription(category.name, category.description);

  return (
    <main id="main-content" tabIndex={-1} className="bg-background flex-1">
      <JsonLd
        data={buildCategoryStructuredData({
          description,
          name: category.name,
          slug: category.slug,
        })}
      />
      <section className="border-line bg-surface border-b">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14">
          <nav
            aria-label="Migas de pan"
            className="text-muted mb-6 flex items-center gap-2 text-xs font-bold"
          >
            <Link href="/catalogo" className="hover:text-brand transition">
              Catálogo
            </Link>
            <span aria-hidden="true">/</span>
            <span>{category.name}</span>
          </nav>
          <p className="text-brand-dark text-xs font-semibold tracking-[0.18em] uppercase">
            Categoría
          </p>
          <h1 className="font-display text-foreground mt-3 text-4xl font-bold tracking-[-0.045em] sm:text-5xl">
            {category.name}
          </h1>
          <p className="text-muted mt-4 max-w-2xl leading-7">{description}</p>
        </div>
      </section>

      <section
        aria-label={`Productos de ${category.name}`}
        className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-10"
      >
        <div className="flex items-center justify-between gap-4">
          <p className="text-muted text-sm font-bold">
            {catalog.totalItems}{" "}
            {catalog.totalItems === 1 ? "producto" : "productos"}
          </p>
          <Link
            href="/catalogo"
            className="text-brand-dark text-sm font-semibold hover:underline"
          >
            Ver catálogo completo
          </Link>
        </div>

        {catalog.items.length > 0 ? (
          <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {catalog.items.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="border-line bg-surface mt-5 rounded-[1.75rem] border border-dashed px-6 py-16 text-center">
            <h2 className="font-display text-foreground text-xl font-bold">
              Próximamente encontrarás productos aquí
            </h2>
            <p className="text-muted mt-2">
              Mientras tanto, explora el resto de nuestro catálogo.
            </p>
          </div>
        )}

        <CatalogPagination
          basePath={`/categoria/${category.slug}`}
          filters={filters}
          totalPages={catalog.totalPages}
        />
      </section>
    </main>
  );
}
