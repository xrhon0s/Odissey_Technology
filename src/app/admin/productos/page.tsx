import type { Metadata } from "next";
import Link from "next/link";

import {
  CategoryCreateForm,
  ProductCreateForm,
} from "@/components/admin/catalog-forms";
import {
  listAdminCategories,
  listAdminProducts,
} from "@/db/queries/admin-catalog";
import { requireAdmin } from "@/features/admin/admin-access";
import { formatCurrency } from "@/lib/format-currency";

export const metadata: Metadata = { title: "Productos | Administración" };
export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  await requireAdmin();
  const [categories, products] = await Promise.all([
    listAdminCategories(),
    listAdminProducts(),
  ]);
  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <p className="text-sm font-bold tracking-widest text-cyan-700 uppercase">
        Catálogo
      </p>
      <h1 className="mt-2 text-3xl font-bold text-slate-950">
        Productos y categorías
      </h1>
      <p className="mt-3 max-w-2xl text-slate-600">
        Crea productos con su primera variante, define precios y controla qué se
        publica en la tienda.
      </p>

      <section className="mt-8 overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 className="font-bold text-slate-950">Productos actuales</h2>
        </div>
        {products.length === 0 ? (
          <p className="p-5 text-sm text-slate-600">
            Todavía no hay productos.
          </p>
        ) : (
          <div className="divide-y divide-slate-200">
            {products.map((product) => (
              <Link
                key={product.id}
                href={`/admin/productos/${product.id}`}
                className="grid gap-2 p-5 hover:bg-slate-50 sm:grid-cols-[1fr_auto_auto] sm:items-center"
              >
                <div>
                  <p className="font-bold text-slate-950">{product.name}</p>
                  <p className="text-sm text-slate-500">
                    {product.categoryName} · {product.variantCount} variante(s)
                  </p>
                </div>
                <span className="text-sm text-slate-700">
                  {product.minimumPriceInCop === null
                    ? "Sin precio"
                    : `Desde ${formatCurrency(product.minimumPriceInCop)}`}
                </span>
                <span
                  className={`w-fit rounded-full px-2.5 py-1 text-xs font-bold ${product.status === "active" ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-700"}`}
                >
                  {product.status === "active"
                    ? "Activo"
                    : product.status === "draft"
                      ? "Borrador"
                      : "Archivado"}
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>

      <div className="mt-8 grid items-start gap-8 lg:grid-cols-[1fr_320px]">
        {categories.length > 0 ? (
          <ProductCreateForm categories={categories} />
        ) : (
          <p className="rounded-xl bg-amber-50 p-5 text-sm text-amber-900">
            Crea primero una categoría para poder agregar productos.
          </p>
        )}
        <div className="grid gap-4">
          <CategoryCreateForm />
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="font-bold text-slate-950">Categorías</h2>
            <ul className="mt-3 grid gap-2 text-sm text-slate-600">
              {categories.map((category) => (
                <li key={category.id} className="flex justify-between gap-3">
                  <span>{category.name}</span>
                  <span>{category.isActive ? "Activa" : "Inactiva"}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
}
