import type { Metadata } from "next";
import Link from "next/link";

import { CatalogFiltersForm } from "@/components/products/catalog-filters";
import { CatalogPagination } from "@/components/products/catalog-pagination";
import { ProductCard } from "@/components/products/product-card";
import { catalogFiltersSchema } from "@/features/catalog/catalog-filters";
import { catalogService } from "@/features/catalog/catalog-service";

export const metadata: Metadata = {
  title: "Catálogo",
  description: "Explora accesorios tecnológicos disponibles en Colombia.",
};

type CatalogPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function CatalogPage({ searchParams }: CatalogPageProps) {
  const parsedFilters = catalogFiltersSchema.safeParse(await searchParams);

  if (!parsedFilters.success) {
    return (
      <main
        id="main-content"
        tabIndex={-1}
        className="mx-auto w-full max-w-7xl flex-1 px-4 py-16 sm:px-6"
      >
        <div className="rounded-[1.75rem] border border-amber-200 bg-amber-50 p-8 text-center">
          <h1 className="font-display text-foreground text-2xl font-bold">
            Filtros no válidos
          </h1>
          <p className="text-muted mt-2">
            Revisa los parámetros utilizados o vuelve al catálogo completo.
          </p>
          <Link
            href="/catalogo"
            className="bg-foreground mt-6 inline-flex rounded-full px-5 py-3 text-sm font-bold text-white"
          >
            Restablecer filtros
          </Link>
        </div>
      </main>
    );
  }

  const filters = parsedFilters.data;
  const [catalog, categories] = await Promise.all([
    catalogService.listProducts(filters),
    catalogService.listCategories(),
  ]);

  return (
    <main id="main-content" tabIndex={-1} className="bg-background flex-1">
      <section className="border-line bg-surface border-b">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14">
          <p className="text-brand-dark flex items-center gap-2 text-xs font-semibold tracking-[0.18em] uppercase">
            <span
              className="bg-accent h-0.5 w-5 rounded-full"
              aria-hidden="true"
            />
            La tienda
          </p>
          <h1 className="font-display text-foreground mt-3 max-w-3xl text-4xl leading-none font-bold tracking-[-0.045em] sm:text-5xl">
            Encuentra tu próximo imprescindible.
          </h1>
          <p className="text-muted mt-4 max-w-2xl text-base leading-7">
            Accesorios prácticos, disponibilidad real y opciones para cada
            dispositivo. Todo en pesos colombianos.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
        <CatalogFiltersForm categories={categories} filters={filters} />

        <div className="mt-8 flex items-center justify-between gap-4">
          <p className="text-muted text-sm font-bold">
            {catalog.totalItems}{" "}
            {catalog.totalItems === 1 ? "producto" : "productos"}
          </p>
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
              No encontramos productos
            </h2>
            <p className="text-muted mt-2">
              Prueba otra búsqueda o elimina los filtros actuales.
            </p>
            <Link
              href="/catalogo"
              className="text-brand-dark hover:text-foreground mt-5 inline-flex text-sm font-semibold"
            >
              Ver todo el catálogo
            </Link>
          </div>
        )}

        <CatalogPagination filters={filters} totalPages={catalog.totalPages} />
      </div>
    </main>
  );
}
