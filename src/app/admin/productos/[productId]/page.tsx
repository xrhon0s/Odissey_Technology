import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  ProductEditForm,
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
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <Link
        href="/admin/productos"
        className="text-sm font-bold text-cyan-700 hover:text-cyan-900"
      >
        ← Volver a productos
      </Link>
      <h1 className="mt-4 text-3xl font-bold text-slate-950">{product.name}</h1>
      <p className="mt-2 text-sm text-slate-500">
        Edita la publicación y sus variantes. Los cambios de existencia se hacen
        desde Inventario.
      </p>
      <div className="mt-8 grid gap-8">
        <ProductEditForm categories={categories} product={product} />
        <section className="grid gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-950">Variantes</h2>
            <p className="mt-1 text-sm text-slate-600">
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
