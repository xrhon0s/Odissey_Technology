import type { Metadata } from "next";
import Link from "next/link";

import {
  CategoryCreateForm,
  CategoryEditForm,
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

function publicationState(product: {
  activeVariantCount: number;
  categoryIsActive: boolean;
  status: "draft" | "active" | "archived";
}) {
  if (product.status === "draft") {
    return { label: "Borrador", visible: false };
  }
  if (product.status === "archived") {
    return { label: "Archivado", visible: false };
  }
  if (!product.categoryIsActive) {
    return { label: "Oculto: categoría inactiva", visible: false };
  }
  if (product.activeVariantCount === 0) {
    return { label: "Oculto: variante inactiva", visible: false };
  }
  return { label: "Visible", visible: true };
}

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
            {products.map((product) => {
              const publication = publicationState(product);
              return (
                <Link
                  key={product.id}
                  href={`/admin/productos/${product.id}`}
                  className="grid gap-2 p-5 hover:bg-slate-50 sm:grid-cols-[1fr_auto_auto] sm:items-center"
                >
                  <div>
                    <p className="font-bold text-slate-950">{product.name}</p>
                    <p className="text-sm text-slate-500">
                      {product.categoryName} · {product.variantCount}{" "}
                      variante(s)
                    </p>
                  </div>
                  <span className="text-sm text-slate-700">
                    {product.minimumPriceInCop === null
                      ? "Sin precio"
                      : `Desde ${formatCurrency(product.minimumPriceInCop)}`}
                  </span>
                  <span
                    className={`w-fit rounded-full px-2.5 py-1 text-xs font-bold ${publication.visible ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-900"}`}
                  >
                    {publication.label}
                  </span>
                </Link>
              );
            })}
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
        <CategoryCreateForm />
      </div>
      <section className="mt-8 rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="text-xl font-bold text-slate-950">Editar categorías</h2>
        <p className="mt-1 text-sm text-slate-600">
          Cambia su visibilidad, orden y descripción en el catálogo.
        </p>
        <div className="mt-5 grid gap-4">
          {categories.map((category) => (
            <CategoryEditForm key={category.id} category={category} />
          ))}
        </div>
      </section>
    </main>
  );
}
