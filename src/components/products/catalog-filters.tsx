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
      className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-4 sm:grid-cols-2 lg:grid-cols-[1fr_220px_220px_auto] lg:items-end"
    >
      <label className="grid gap-2 text-sm font-semibold text-slate-800">
        Buscar
        <input
          type="search"
          name="search"
          defaultValue={filters.search}
          placeholder="Audífonos, cables, cargadores…"
          maxLength={100}
          className="h-11 rounded-xl border border-slate-300 px-3 font-normal"
        />
      </label>
      <label className="grid gap-2 text-sm font-semibold text-slate-800">
        Categoría
        <select
          name="category"
          defaultValue={filters.category ?? ""}
          className="h-11 rounded-xl border border-slate-300 bg-white px-3 font-normal"
        >
          <option value="">Todas</option>
          {categories.map((category) => (
            <option key={category.id} value={category.slug}>
              {category.name}
            </option>
          ))}
        </select>
      </label>
      <label className="grid gap-2 text-sm font-semibold text-slate-800">
        Ordenar
        <select
          name="sort"
          defaultValue={filters.sort}
          className="h-11 rounded-xl border border-slate-300 bg-white px-3 font-normal"
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
          className="h-11 flex-1 rounded-xl bg-slate-950 px-5 text-sm font-semibold text-white hover:bg-cyan-900"
        >
          Aplicar
        </button>
        <Link
          href="/catalogo"
          className="flex h-11 items-center rounded-xl border border-slate-300 px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          Limpiar
        </Link>
      </div>
    </form>
  );
}
