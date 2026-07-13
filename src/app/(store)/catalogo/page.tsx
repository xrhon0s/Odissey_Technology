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
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-16 sm:px-6">
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-8 text-center">
          <h1 className="text-2xl font-bold text-slate-950">
            Filtros no válidos
          </h1>
          <p className="mt-2 text-slate-600">
            Revisa los parámetros utilizados o vuelve al catálogo completo.
          </p>
          <Link
            href="/catalogo"
            className="mt-6 inline-flex rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white"
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
    <main className="flex-1 bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
        <div className="mb-8">
          <p className="text-sm font-bold tracking-widest text-cyan-700 uppercase">
            Tienda
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            Catálogo de tecnología
          </h1>
          <p className="mt-3 max-w-2xl text-slate-600">
            Encuentra accesorios prácticos para tus dispositivos, con
            disponibilidad actualizada por variante.
          </p>
        </div>

        <CatalogFiltersForm categories={categories} filters={filters} />

        <div className="mt-8 flex items-center justify-between gap-4">
          <p className="text-sm text-slate-600">
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
          <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
            <h2 className="text-xl font-bold text-slate-950">
              No encontramos productos
            </h2>
            <p className="mt-2 text-slate-600">
              Prueba otra búsqueda o elimina los filtros actuales.
            </p>
            <Link
              href="/catalogo"
              className="mt-5 inline-flex text-sm font-bold text-cyan-800 hover:underline"
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
