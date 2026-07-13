import Image from "next/image";
import Link from "next/link";

import type { CatalogProductSummary } from "@/db/queries/catalog";
import { formatCurrency } from "@/lib/format-currency";

export function ProductCard({ product }: { product: CatalogProductSummary }) {
  return (
    <article className="group overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:-translate-y-0.5 hover:border-cyan-300">
      <Link href={`/producto/${product.slug}`} className="block">
        <div className="relative aspect-square overflow-hidden bg-slate-100">
          {product.primaryImageUrl ? (
            <Image
              src={product.primaryImageUrl}
              alt={product.primaryImageAlt ?? product.name}
              fill
              sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
              className="object-cover transition duration-300 group-hover:scale-[1.03]"
            />
          ) : (
            <div className="flex h-full items-center justify-center px-6 text-center text-sm text-slate-500">
              Imagen próximamente
            </div>
          )}
          {product.isFeatured ? (
            <span className="absolute top-3 left-3 rounded-full bg-slate-950 px-3 py-1 text-xs font-semibold text-white">
              Destacado
            </span>
          ) : null}
        </div>
        <div className="p-4">
          <p className="text-xs font-medium text-cyan-700">
            {product.categoryName}
          </p>
          <h2 className="mt-1 min-h-12 font-semibold text-slate-950 group-hover:text-cyan-800">
            {product.name}
          </h2>
          <p className="mt-3 text-lg font-bold text-slate-950">
            Desde {formatCurrency(product.minimumPriceInCop)}
          </p>
          <p
            className={`mt-1 text-xs font-medium ${product.availableQuantity > 0 ? "text-emerald-700" : "text-slate-500"}`}
          >
            {product.availableQuantity > 0 ? "Disponible" : "Agotado"}
          </p>
        </div>
      </Link>
    </article>
  );
}
