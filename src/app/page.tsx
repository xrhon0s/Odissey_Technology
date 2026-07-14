import type { Metadata } from "next";
import Link from "next/link";

import { ProductCard } from "@/components/products/product-card";
import { catalogService } from "@/features/catalog/catalog-service";

export const metadata: Metadata = {
  title: "Accesorios tecnológicos en Colombia",
  description:
    "Audífonos, cargadores, cables y accesorios tecnológicos con envíos en Colombia.",
};

export const dynamic = "force-dynamic";

const purchaseBenefits = [
  {
    title: "Compra acompañada",
    description:
      "Revisamos cada pedido y te contactamos para coordinar el pago y la entrega.",
  },
  {
    title: "Pagos flexibles",
    description:
      "Puedes pagar por Nequi, DaviPlata, Bancolombia o contraentrega donde esté disponible.",
  },
  {
    title: "Envíos en Colombia",
    description:
      "Despachamos a nivel nacional y ofrecemos opciones locales en el Valle de Aburrá.",
  },
] as const;

export default async function Home() {
  const [categories, catalog] = await Promise.all([
    catalogService.listCategories(),
    catalogService.listProducts({ page: 1, pageSize: 4, sort: "featured" }),
  ]);

  return (
    <main className="flex-1 bg-white">
      <section className="relative isolate overflow-hidden bg-slate-950 text-white">
        <div
          aria-hidden="true"
          className="absolute inset-y-0 right-0 -z-10 w-2/3 bg-[radial-gradient(circle_at_center,_rgba(34,211,238,0.22),_transparent_62%)]"
        />
        <div className="mx-auto grid max-w-6xl gap-12 px-4 py-20 sm:px-6 sm:py-28 lg:grid-cols-[1fr_360px] lg:items-center">
          <div>
            <p className="text-sm font-bold tracking-[0.24em] text-cyan-300 uppercase">
              Odissey Technology
            </p>
            <h1 className="mt-4 max-w-3xl text-4xl font-black tracking-tight text-balance sm:text-6xl">
              Tecnología útil para acompañar tu día.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
              Accesorios seleccionados, precios claros y atención cercana para
              comprar desde cualquier lugar de Colombia.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/catalogo"
                className="inline-flex rounded-xl bg-cyan-400 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-300"
              >
                Explorar catálogo
              </Link>
              <Link
                href="/catalogo?sort=newest"
                className="inline-flex rounded-xl border border-slate-600 px-5 py-3 text-sm font-bold text-white transition hover:border-cyan-300 hover:text-cyan-200"
              >
                Ver novedades
              </Link>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-700 bg-slate-900/80 p-6 shadow-2xl shadow-cyan-950/40 backdrop-blur">
            <p className="text-xs font-bold tracking-widest text-cyan-300 uppercase">
              Compra fácil
            </p>
            <p className="mt-3 text-2xl font-bold">Elige, confirma y recibe.</p>
            <ol className="mt-6 grid gap-4 text-sm text-slate-300">
              <li className="flex gap-3">
                <span className="font-black text-cyan-300">01</span>
                Agrega tus productos al carrito.
              </li>
              <li className="flex gap-3">
                <span className="font-black text-cyan-300">02</span>
                Completa los datos de entrega y pago.
              </li>
              <li className="flex gap-3">
                <span className="font-black text-cyan-300">03</span>
                Coordinamos contigo la confirmación del pedido.
              </li>
            </ol>
          </div>
        </div>
      </section>

      {categories.length > 0 ? (
        <section
          aria-labelledby="categories-title"
          className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-18"
        >
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm font-bold tracking-widest text-cyan-700 uppercase">
                Encuentra lo que buscas
              </p>
              <h2
                id="categories-title"
                className="mt-2 text-3xl font-bold tracking-tight text-slate-950"
              >
                Compra por categoría
              </h2>
            </div>
            <Link
              href="/catalogo"
              className="text-sm font-bold text-cyan-800 hover:underline"
            >
              Ver todas
            </Link>
          </div>
          <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category, index) => (
              <Link
                key={category.id}
                href={`/catalogo?category=${category.slug}`}
                className="group rounded-2xl border border-slate-200 bg-slate-50 p-6 transition hover:-translate-y-0.5 hover:border-cyan-300 hover:bg-cyan-50"
              >
                <span className="text-xs font-black tracking-widest text-cyan-700">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-5 text-xl font-bold text-slate-950 group-hover:text-cyan-900">
                  {category.name}
                </h3>
                <p className="mt-2 text-sm font-semibold text-slate-500 group-hover:text-cyan-800">
                  Explorar productos →
                </p>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {catalog.items.length > 0 ? (
        <section
          aria-labelledby="featured-title"
          className="border-y border-slate-200 bg-slate-50"
        >
          <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-18">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-sm font-bold tracking-widest text-cyan-700 uppercase">
                  Selección Odissey
                </p>
                <h2
                  id="featured-title"
                  className="mt-2 text-3xl font-bold tracking-tight text-slate-950"
                >
                  Productos para comenzar
                </h2>
              </div>
              <Link
                href="/catalogo"
                className="text-sm font-bold text-cyan-800 hover:underline"
              >
                Ver catálogo completo
              </Link>
            </div>
            <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {catalog.items.map((product) => (
                <ProductCard
                  key={product.id}
                  headingLevel="h3"
                  product={product}
                />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section
        aria-labelledby="benefits-title"
        className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-18"
      >
        <div className="max-w-2xl">
          <p className="text-sm font-bold tracking-widest text-cyan-700 uppercase">
            Compra con tranquilidad
          </p>
          <h2
            id="benefits-title"
            className="mt-2 text-3xl font-bold tracking-tight text-slate-950"
          >
            Una experiencia clara de principio a fin
          </h2>
        </div>
        <div className="mt-7 grid gap-5 md:grid-cols-3">
          {purchaseBenefits.map((benefit) => (
            <article
              key={benefit.title}
              className="rounded-2xl border border-slate-200 p-6"
            >
              <h3 className="text-lg font-bold text-slate-950">
                {benefit.title}
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {benefit.description}
              </p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
