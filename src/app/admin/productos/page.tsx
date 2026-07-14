import type { Metadata } from "next";
import Link from "next/link";

import {
  CategoryCreateForm,
  CategoryEditForm,
  ProductCreateForm,
} from "@/components/admin/catalog-forms";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
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
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
      <AdminPageHeader
        action={
          <a
            href="#nuevo-producto"
            className="bg-foreground hover:bg-brand-dark inline-flex h-11 items-center rounded-xl px-5 text-sm font-extrabold text-white transition"
          >
            + Nuevo producto
          </a>
        }
        description="Publica productos, administra sus variantes y organiza las categorías del catálogo."
        eyebrow="Catálogo"
        title="Productos"
      />

      <section className="border-line bg-surface mt-7 overflow-hidden rounded-2xl border">
        <div className="border-line flex items-center justify-between border-b px-5 py-4">
          <div>
            <h2 className="font-display text-foreground font-extrabold">
              Productos actuales
            </h2>
            <p className="text-muted mt-1 text-xs">
              {products.length} producto(s) registrado(s)
            </p>
          </div>
        </div>
        {products.length === 0 ? (
          <p className="text-muted p-8 text-center text-sm">
            Todavía no hay productos. Crea el primero en el formulario de abajo.
          </p>
        ) : (
          <div className="divide-line divide-y">
            {products.map((product) => {
              const publication = publicationState(product);
              return (
                <Link
                  key={product.id}
                  href={`/admin/productos/${product.id}`}
                  className="hover:bg-brand/5 grid gap-3 p-5 transition sm:grid-cols-[1fr_auto_auto] sm:items-center"
                >
                  <div>
                    <p className="font-display text-foreground font-extrabold">
                      {product.name}
                    </p>
                    <p className="text-muted text-sm">
                      {product.categoryName} · {product.variantCount}{" "}
                      variante(s)
                    </p>
                  </div>
                  <span className="text-foreground text-sm font-semibold">
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

      <div
        id="nuevo-producto"
        className="mt-8 grid scroll-mt-6 items-start gap-8 lg:grid-cols-[1fr_340px]"
      >
        {categories.length > 0 ? (
          <ProductCreateForm categories={categories} />
        ) : (
          <p className="bg-brand-yellow/20 rounded-2xl p-5 text-sm text-amber-900">
            Crea primero una categoría para poder agregar productos.
          </p>
        )}
        <CategoryCreateForm />
      </div>
      <section className="border-line bg-surface mt-8 rounded-2xl border p-5 sm:p-6">
        <h2 className="font-display text-foreground text-xl font-extrabold">
          Editar categorías
        </h2>
        <p className="text-muted mt-1 text-sm">
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
