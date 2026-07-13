import Link from "next/link";

import type { CatalogFilters } from "@/features/catalog/catalog-filters";

function pageHref(filters: CatalogFilters, page: number): string {
  const parameters = new URLSearchParams();
  if (filters.search) parameters.set("search", filters.search);
  if (filters.category) parameters.set("category", filters.category);
  if (filters.sort !== "featured") parameters.set("sort", filters.sort);
  if (filters.pageSize !== 12)
    parameters.set("pageSize", String(filters.pageSize));
  parameters.set("page", String(page));
  return `/catalogo?${parameters.toString()}`;
}

export function CatalogPagination({
  filters,
  totalPages,
}: {
  filters: CatalogFilters;
  totalPages: number;
}) {
  if (totalPages <= 1) return null;

  return (
    <nav
      aria-label="Paginación del catálogo"
      className="mt-10 flex items-center justify-center gap-4"
    >
      {filters.page > 1 ? (
        <Link
          href={pageHref(filters, filters.page - 1)}
          className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold hover:bg-slate-50"
        >
          Anterior
        </Link>
      ) : null}
      <span className="text-sm text-slate-600">
        Página {filters.page} de {totalPages}
      </span>
      {filters.page < totalPages ? (
        <Link
          href={pageHref(filters, filters.page + 1)}
          className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold hover:bg-slate-50"
        >
          Siguiente
        </Link>
      ) : null}
    </nav>
  );
}
