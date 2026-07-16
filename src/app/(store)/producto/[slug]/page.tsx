import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ProductPurchasePanel } from "@/components/products/product-purchase-panel";
import { ProductGallery } from "@/components/products/product-gallery";
import { productSlugSchema } from "@/features/catalog/catalog-filters";
import { catalogService } from "@/features/catalog/catalog-service";

type ProductPageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const parsedSlug = productSlugSchema.safeParse((await params).slug);
  if (!parsedSlug.success) return { title: "Producto" };

  const product = await catalogService.getProductBySlug(parsedSlug.data);
  if (!product) return { title: "Producto" };

  return {
    title: product.name,
    description: product.description.slice(0, 160),
    openGraph: product.images[0]
      ? {
          images: [
            { alt: product.images[0].altText, url: product.images[0].url },
          ],
        }
      : undefined,
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const parsedSlug = productSlugSchema.safeParse((await params).slug);
  if (!parsedSlug.success) notFound();

  const product = await catalogService.getProductBySlug(parsedSlug.data);
  if (!product) notFound();

  const mainImage = product.images[0];

  return (
    <main className="bg-background flex-1">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-10">
        <nav
          aria-label="Migas de pan"
          className="text-muted mb-6 flex items-center gap-2 text-xs font-bold"
        >
          <Link href="/catalogo" className="hover:text-brand transition">
            Catálogo
          </Link>
          <span aria-hidden="true">/</span>
          <span>{product.categoryName}</span>
        </nav>

        <div className="grid gap-10 lg:grid-cols-[1.08fr_0.92fr] lg:gap-16">
          <div className="lg:sticky lg:top-32 lg:self-start">
            <ProductGallery
              images={product.images}
              productName={product.name}
            />
          </div>

          <section aria-labelledby="product-title" className="py-2 lg:py-6">
            <p className="text-brand-dark flex items-center gap-2 text-xs font-semibold tracking-[0.18em] uppercase">
              <span
                className="bg-accent h-0.5 w-5 rounded-full"
                aria-hidden="true"
              />
              {product.categoryName}
            </p>
            <h1
              id="product-title"
              className="font-display text-foreground mt-4 text-4xl leading-[1.02] font-bold tracking-[-0.045em] sm:text-5xl"
            >
              {product.name}
            </h1>
            <p className="text-muted mt-5 text-base leading-7">
              {product.description}
            </p>

            <ProductPurchasePanel
              productName={product.name}
              productSlug={product.slug}
              imageUrl={mainImage?.url ?? null}
              imageAlt={mainImage?.altText ?? null}
              variants={product.variants}
            />

            <div className="divide-line border-line mt-8 divide-y border-y">
              {product.compatibility ? (
                <div className="grid gap-2 py-5 sm:grid-cols-[150px_1fr]">
                  <h2 className="text-foreground text-sm font-bold">
                    Compatibilidad
                  </h2>
                  <p className="text-muted text-sm leading-6">
                    {product.compatibility}
                  </p>
                </div>
              ) : null}
              {product.warranty ? (
                <div className="grid gap-2 py-5 sm:grid-cols-[150px_1fr]">
                  <h2 className="text-foreground text-sm font-bold">
                    Garantía
                  </h2>
                  <p className="text-muted text-sm leading-6">
                    {product.warranty}
                  </p>
                </div>
              ) : null}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
