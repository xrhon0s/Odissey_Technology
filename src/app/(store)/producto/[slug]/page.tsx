import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ProductPurchasePanel } from "@/components/products/product-purchase-panel";
import { productSlugSchema } from "@/features/catalog/catalog-filters";
import { catalogService } from "@/features/catalog/catalog-service";

export const metadata: Metadata = { title: "Producto" };

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const parsedSlug = productSlugSchema.safeParse((await params).slug);
  if (!parsedSlug.success) notFound();

  const product = await catalogService.getProductBySlug(parsedSlug.data);
  if (!product) notFound();

  const mainImage = product.images[0];

  return (
    <main className="flex-1 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
        <nav aria-label="Migas de pan" className="mb-6 text-sm text-slate-600">
          <Link
            href="/catalogo"
            className="hover:text-cyan-800 hover:underline"
          >
            Catálogo
          </Link>
          <span aria-hidden="true"> / </span>
          <span>{product.categoryName}</span>
        </nav>

        <div className="grid gap-10 lg:grid-cols-2">
          <div>
            <div className="relative aspect-square overflow-hidden rounded-3xl bg-slate-100">
              {mainImage ? (
                <Image
                  src={mainImage.url}
                  alt={mainImage.altText}
                  fill
                  priority
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-slate-500">
                  Imagen próximamente
                </div>
              )}
            </div>
            {product.images.length > 1 ? (
              <div
                className="mt-4 grid grid-cols-2 gap-4"
                aria-label="Imágenes adicionales del producto"
              >
                {product.images.slice(1).map((image) => (
                  <div
                    key={image.id}
                    className="relative aspect-square overflow-hidden rounded-2xl bg-slate-100"
                  >
                    <Image
                      src={image.url}
                      alt={image.altText}
                      fill
                      sizes="(min-width: 1024px) 25vw, 50vw"
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            ) : null}
          </div>

          <section aria-labelledby="product-title">
            <p className="text-sm font-bold tracking-widest text-cyan-700 uppercase">
              {product.categoryName}
            </p>
            <h1
              id="product-title"
              className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl"
            >
              {product.name}
            </h1>
            <p className="mt-5 leading-7 text-slate-600">
              {product.description}
            </p>

            <ProductPurchasePanel
              productName={product.name}
              productSlug={product.slug}
              imageUrl={mainImage?.url ?? null}
              imageAlt={mainImage?.altText ?? null}
              variants={product.variants}
            />

            {product.compatibility ? (
              <div className="mt-7">
                <h2 className="font-bold text-slate-950">Compatibilidad</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {product.compatibility}
                </p>
              </div>
            ) : null}
            {product.warranty ? (
              <div className="mt-5">
                <h2 className="font-bold text-slate-950">Garantía</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {product.warranty}
                </p>
              </div>
            ) : null}
          </section>
        </div>
      </div>
    </main>
  );
}
