import Image from "next/image";
import Link from "next/link";

import type { CatalogProductSummary } from "@/db/queries/catalog";
import { formatCurrency } from "@/lib/format-currency";

export function ProductCard({
  headingLevel = "h2",
  product,
}: {
  headingLevel?: "h2" | "h3";
  product: CatalogProductSummary;
}) {
  const Heading = headingLevel;

  return (
    <article className="group bg-surface hover:shadow-soft relative rounded-[1.5rem] p-2.5 transition duration-300 hover:-translate-y-1">
      <Link
        href={`/producto/${product.slug}`}
        className="block rounded-[1.15rem]"
      >
        <div className="bg-surface-muted relative aspect-square overflow-hidden rounded-[1.15rem]">
          {product.primaryImageUrl ? (
            <Image
              src={product.primaryImageUrl}
              alt={product.primaryImageAlt ?? product.name}
              fill
              sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
              className="object-cover transition duration-500 group-hover:scale-[1.04]"
            />
          ) : (
            <div className="text-muted flex h-full flex-col items-center justify-center gap-3 px-6 text-center text-sm font-bold">
              <span
                aria-hidden="true"
                className="border-brand/20 text-brand grid size-16 place-items-center rounded-full border-[12px]"
              >
                •
              </span>
              Imagen próximamente
            </div>
          )}
          {product.isFeatured ? (
            <span className="bg-accent text-foreground absolute top-3 left-3 rounded-full px-3 py-1.5 text-[10px] font-bold tracking-wide uppercase">
              Favorito
            </span>
          ) : null}
        </div>
        <div className="px-2 pt-4 pb-3">
          <p className="text-brand-dark text-[10px] font-semibold tracking-[0.14em] uppercase">
            {product.categoryName}
          </p>
          <Heading className="text-foreground group-hover:text-brand mt-1.5 min-h-12 text-[15px] leading-6 font-bold transition">
            {product.name}
          </Heading>
          <p className="font-display text-foreground mt-3 text-lg font-bold tracking-tight">
            Desde {formatCurrency(product.minimumPriceInCop)}
          </p>
          <p
            className={`mt-2 inline-flex items-center gap-1.5 text-[11px] font-bold ${product.availableQuantity > 0 ? "text-success" : "text-muted"}`}
          >
            <span
              aria-hidden="true"
              className={`size-1.5 rounded-full ${product.availableQuantity > 0 ? "bg-success" : "bg-muted"}`}
            />
            {product.availableQuantity > 0 ? "Disponible ahora" : "Agotado"}
          </p>
        </div>
      </Link>
    </article>
  );
}
