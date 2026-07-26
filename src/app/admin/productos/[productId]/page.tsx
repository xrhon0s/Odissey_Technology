import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  ProductEditForm,
  ProductImageCreateForm,
  ProductImageEditForm,
  VariantCreateForm,
  VariantEditForm,
} from "@/components/admin/catalog-forms";
import {
  getAdminProduct,
  listAdminCategories,
} from "@/db/queries/admin-catalog";
import { requireAdmin } from "@/features/admin/admin-access";

export const metadata: Metadata = { title: "Editar producto | Administración" };
export const dynamic = "force-dynamic";

export default async function AdminProductDetailPage({
  params,
}: {
  params: Promise<{ productId: string }>;
}) {
  await requireAdmin();
  const { productId } = await params;
  const [product, categories] = await Promise.all([
    getAdminProduct(productId),
    listAdminCategories(),
  ]);
  if (!product) notFound();
  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10"
    >
      <Link
        href="/admin/productos"
        className="text-brand-dark text-sm font-extrabold hover:underline"
      >
        ← Volver a productos
      </Link>
      <h1 className="font-display text-foreground mt-4 text-3xl font-extrabold sm:text-4xl">
        {product.name}
      </h1>
      <p className="text-muted mt-2 text-sm">
        Edita la publicación y sus variantes. Los cambios de existencia se hacen
        desde Inventario.
      </p>
      {product.status === "active" &&
        (!product.categoryIsActive ||
          product.variants.every((variant) => !variant.isActive)) && (
          <div className="border-brand-yellow bg-brand-yellow/20 mt-5 rounded-2xl border p-4 text-sm text-amber-950">
            <p className="font-bold">Este producto todavía no es visible.</p>
            <p className="mt-1">
              {!product.categoryIsActive
                ? "Activa su categoría para publicarlo en el catálogo."
                : "Activa al menos una variante marcando “Variante disponible” y guarda los cambios."}
            </p>
          </div>
        )}
      <div className="mt-8 grid gap-8">
        <ProductEditForm categories={categories} product={product} />
        <section className="grid gap-4">
          <div>
            <h2 className="font-display text-foreground text-2xl font-extrabold">
              Imágenes
            </h2>
            <p className="text-muted mt-1 text-sm">
              La imagen con el orden más bajo será la portada. Los archivos se
              guardan en Supabase Storage.
            </p>
          </div>
          {product.images.map((image) => (
            <ProductImageEditForm
              key={image.id}
              image={image}
              productId={product.id}
            />
          ))}
          <ProductImageCreateForm productId={product.id} />
        </section>
        <section className="grid gap-4">
          <div>
            <h2 className="font-display text-foreground text-2xl font-extrabold">
              Variantes
            </h2>
            <p className="text-muted mt-1 text-sm">
              Precios, SKU, disponibilidad y alerta de stock.
            </p>
          </div>
          {product.variants.map((variant) => (
            <VariantEditForm
              key={variant.id}
              productId={product.id}
              variant={variant}
            />
          ))}
          <VariantCreateForm productId={product.id} />
        </section>
      </div>
    </main>
  );
}
