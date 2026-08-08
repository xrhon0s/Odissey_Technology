import Link from "next/link";

import type { CatalogFilters } from "@/features/catalog/catalog-filters";

type CategoryOption = { id: string; name: string; slug: string };

export function CatalogFiltersForm({
  categories,
  filters,
}: {
  categories: CategoryOption[];
  filters: CatalogFilters;
}) {
  return (
    <form
      action="/catalogo"
      className="border-line bg-surface shadow-soft grid gap-4 rounded-[1.5rem] border p-4 sm:grid-cols-2 lg:grid-cols-[1fr_220px_220px_auto] lg:items-end lg:p-5"
    >
      <label className="text-foreground grid gap-2 text-xs font-bold tracking-wide uppercase">
        Buscar
        <input
          type="search"
          name="search"
          defaultValue={filters.search}
          placeholder="Audífonos, cables, cargadores…"
          maxLength={100}
          className="border-line bg-background placeholder:text-muted/70 focus:border-brand h-12 rounded-[0.9rem] border px-4 text-sm font-medium tracking-normal normal-case"
        />
      </label>
      <label className="text-foreground grid gap-2 text-xs font-bold tracking-wide uppercase">
        Categoría
        <select
          name="category"
          defaultValue={filters.category ?? ""}
          className="border-line bg-background focus:border-brand h-12 rounded-[0.9rem] border px-4 text-sm font-medium tracking-normal normal-case"
        >
          <option value="">Todas</option>
          {categories.map((category) => (
            <option key={category.id} value={category.slug}>
              {category.name}
            </option>
          ))}
        </select>
      </label>
      <label className="text-foreground grid gap-2 text-xs font-bold tracking-wide uppercase">
        Ordenar
        <select
          name="sort"
          defaultValue={filters.sort}
          className="border-line bg-background focus:border-brand h-12 rounded-[0.9rem] border px-4 text-sm font-medium tracking-normal normal-case"
        >
          <option value="featured">Destacados</option>
          <option value="newest">Más recientes</option>
          <option value="price-asc">Menor precio</option>
          <option value="price-desc">Mayor precio</option>
        </select>
      </label>
      <div className="flex gap-2">
        <button
          type="submit"
          className="bg-brand hover:bg-brand-dark h-12 flex-1 rounded-full px-5 text-sm font-bold text-white transition"
        >
          Aplicar
        </button>
        <Link
          href="/catalogo"
          className="border-line text-muted hover:border-foreground hover:text-foreground flex h-12 items-center rounded-full border px-4 text-sm font-bold transition"
        >
          Limpiar
        </Link>
      </div>
    </form>
  );
}
