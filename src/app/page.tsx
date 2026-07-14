import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { ProductCard } from "@/components/products/product-card";
import { SectionHeading } from "@/components/ui/section-heading";
import { catalogService } from "@/features/catalog/catalog-service";

export const metadata: Metadata = {
  title: "Accesorios tecnológicos en Colombia",
  description:
    "Audífonos, cargadores, cables y accesorios tecnológicos con envíos en Colombia.",
};

export const dynamic = "force-dynamic";

const purchaseBenefits = [
  {
    number: "01",
    title: "Compra acompañada",
    description:
      "Te ayudamos a confirmar compatibilidad, pago y entrega sin respuestas automáticas.",
  },
  {
    number: "02",
    title: "Pagas como prefieras",
    description:
      "Nequi, DaviPlata, Bancolombia o efectivo contraentrega donde esté disponible.",
  },
  {
    number: "03",
    title: "Medellín y toda Colombia",
    description:
      "Entrega local en el Valle de Aburrá y despachos nacionales coordinados.",
  },
] as const;

const categoryStyles = [
  "bg-brand-soft text-brand-dark",
  "bg-accent-soft text-[#9f3512]",
  "bg-[#e4f5ee] text-[#10664a]",
] as const;

export default async function Home() {
  const [categories, catalog] = await Promise.all([
    catalogService.listCategories(),
    catalogService.listProducts({ page: 1, pageSize: 4, sort: "featured" }),
  ]);
  return (
    <main className="flex-1 overflow-hidden">
      <section className="bg-foreground relative isolate text-white">
        <div
          aria-hidden="true"
          className="border-brand/60 absolute -top-24 -right-32 -z-10 size-[28rem] rounded-full border-[72px] sm:size-[38rem]"
        />
        <div
          aria-hidden="true"
          className="bg-accent absolute right-[28%] bottom-14 -z-10 size-6 rounded-full"
        />
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-[1.05fr_0.8fr] lg:items-center lg:py-24">
          <div className="relative z-10">
            <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-black tracking-[0.16em] text-blue-200 uppercase">
              <span
                className="bg-accent size-2 rounded-full"
                aria-hidden="true"
              />
              Tecnología para todos los días
            </p>
            <h1 className="font-display mt-6 max-w-3xl text-[clamp(2.8rem,8vw,5.7rem)] leading-[0.96] font-black tracking-[-0.055em] text-balance">
              Lo útil también puede verse
              <span className="text-[#8ca8ff]"> increíble.</span>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-slate-300 sm:text-lg sm:leading-8">
              Accesorios confiables para cargar, conectar y disfrutar tus
              dispositivos. Seleccionados en Medellín, listos para acompañarte.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/catalogo"
                className="bg-brand inline-flex min-h-12 items-center gap-2 rounded-full px-6 py-3 text-sm font-black text-white transition hover:-translate-y-0.5 hover:bg-[#416cff]"
              >
                Explorar productos
                <span aria-hidden="true">→</span>
              </Link>
              <Link
                href="/pedido"
                className="inline-flex min-h-12 items-center rounded-full border border-white/25 px-6 py-3 text-sm font-black text-white transition hover:border-white hover:bg-white/5"
              >
                Consultar pedido
              </Link>
            </div>
            <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3 border-t border-white/10 pt-6 text-xs font-bold text-slate-300">
              <span>✓ Compra sin registro</span>
              <span>✓ Atención por WhatsApp</span>
              <span>✓ Precios en COP</span>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[34rem] lg:mr-0">
            <div
              aria-hidden="true"
              className="border-accent/90 absolute top-[18%] left-[2%] size-20 rounded-full border-[18px]"
            />
            <div
              aria-hidden="true"
              className="bg-brand absolute right-[2%] bottom-[14%] size-5 rounded-full"
            />
            <div className="relative aspect-[4/4.7] overflow-hidden rounded-[2.5rem]">
              <Image
                src="/images/hero-wireless-earbuds.webp"
                alt="Audífonos inalámbricos blancos flotando sobre su estuche de carga abierto"
                fill
                priority
                sizes="(min-width: 1024px) 44vw, 95vw"
                className="object-cover object-center drop-shadow-2xl"
              />
              <span className="bg-foreground/75 absolute right-4 bottom-5 rounded-full border border-white/15 px-3 py-1.5 text-[10px] font-black tracking-[0.12em] text-blue-200 uppercase backdrop-blur">
                Sonido sin límites
              </span>
            </div>
          </div>
        </div>
      </section>

      {categories.length > 0 ? (
        <section
          aria-labelledby="categories-title"
          className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20"
        >
          <SectionHeading
            eyebrow="Encuentra tu accesorio"
            id="categories-title"
            title="¿Qué necesitas hoy?"
            description="Explora por tipo de producto y encuentra rápidamente lo que funciona con tus dispositivos."
            action={
              <Link
                href="/catalogo"
                className="text-brand hover:text-brand-dark inline-flex items-center gap-2 text-sm font-black"
              >
                Ver todo <span aria-hidden="true">→</span>
              </Link>
            }
          />
          <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category, index) => (
              <Link
                key={category.id}
                href={`/catalogo?category=${category.slug}`}
                className={`group relative min-h-48 overflow-hidden rounded-[1.75rem] p-6 transition hover:-translate-y-1 ${categoryStyles[index % categoryStyles.length]}`}
              >
                <span className="text-xs font-black tracking-[0.16em] opacity-65">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="font-display mt-12 max-w-[80%] text-2xl font-black tracking-[-0.035em]">
                  {category.name}
                </h3>
                <span className="absolute right-5 bottom-5 grid size-11 place-items-center rounded-full bg-white text-xl font-black shadow-sm transition group-hover:translate-x-1">
                  →
                </span>
                <span
                  aria-hidden="true"
                  className="absolute -top-12 -right-12 size-36 rounded-full border-[28px] border-current opacity-10"
                />
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {catalog.items.length > 0 ? (
        <section
          aria-labelledby="featured-title"
          className="border-line bg-surface border-y"
        >
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20">
            <SectionHeading
              eyebrow="Selección Odissey"
              id="featured-title"
              title="Productos que resuelven"
              description="Una selección corta y práctica para mejorar tu rutina tecnológica sin complicarte."
              action={
                <Link
                  href="/catalogo"
                  className="text-brand hover:text-brand-dark inline-flex items-center gap-2 text-sm font-black"
                >
                  Catálogo completo <span aria-hidden="true">→</span>
                </Link>
              }
            />
            <div className="mt-9 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
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
        className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20"
      >
        <SectionHeading
          eyebrow="Así de simple"
          id="benefits-title"
          title="Tecnología con trato humano"
          description="Comprar por internet no debería sentirse distante. Te acompañamos antes y después del pedido."
        />
        <div className="border-line mt-10 grid border-t md:grid-cols-3">
          {purchaseBenefits.map((benefit) => (
            <article
              key={benefit.title}
              className="border-line border-b py-7 md:border-r md:px-7 md:first:pl-0 md:last:border-r-0"
            >
              <span className="font-display text-brand/25 text-4xl font-black">
                {benefit.number}
              </span>
              <h3 className="text-foreground mt-5 text-lg font-black">
                {benefit.title}
              </h3>
              <p className="text-muted mt-2 text-sm leading-6">
                {benefit.description}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-accent text-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-12 sm:px-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-black tracking-[0.16em] uppercase opacity-80">
              ¿Tienes dudas?
            </p>
            <h2 className="font-display mt-2 text-3xl font-black tracking-[-0.04em] sm:text-4xl">
              Te ayudamos a elegir bien.
            </h2>
          </div>
          <Link
            href="/catalogo"
            className="text-foreground inline-flex min-h-12 w-fit items-center rounded-full bg-white px-6 py-3 text-sm font-black transition hover:-translate-y-0.5"
          >
            Empezar a explorar →
          </Link>
        </div>
      </section>
    </main>
  );
}
