import Link from "next/link";

import type { CatalogFilters } from "@/features/catalog/catalog-filters";

function pageHref(
  basePath: string,
  filters: CatalogFilters,
  page: number,
): string {
  const parameters = new URLSearchParams();
  if (filters.search) parameters.set("search", filters.search);
  if (basePath === "/catalogo" && filters.category)
    parameters.set("category", filters.category);
  if (filters.sort !== "featured") parameters.set("sort", filters.sort);
  if (filters.pageSize !== 12)
    parameters.set("pageSize", String(filters.pageSize));
  if (page > 1) parameters.set("page", String(page));
  const query = parameters.toString();
  return query ? `${basePath}?${query}` : basePath;
}

export function CatalogPagination({
  basePath = "/catalogo",
  filters,
  totalPages,
}: {
  basePath?: string;
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
          href={pageHref(basePath, filters, filters.page - 1)}
          className="border-line bg-surface hover:border-brand rounded-full border px-4 py-2 text-sm font-semibold transition"
        >
          Anterior
        </Link>
      ) : null}
      <span className="text-sm text-slate-600">
        Página {filters.page} de {totalPages}
      </span>
      {filters.page < totalPages ? (
        <Link
          href={pageHref(basePath, filters, filters.page + 1)}
          className="border-line bg-surface hover:border-brand rounded-full border px-4 py-2 text-sm font-semibold transition"
        >
          Siguiente
        </Link>
      ) : null}
    </nav>
  );
}
