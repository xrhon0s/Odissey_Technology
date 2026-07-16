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
    title: "Compra en pocos pasos",
    description:
      "Elige tus productos, agrégalos al carrito y confirma tu pedido de forma sencilla.",
  },
  {
    number: "02",
    title: "Pagos flexibles",
    description:
      "Paga por Nequi, Bancolombia o en efectivo contraentrega en el Valle de Aburrá.",
  },
  {
    number: "03",
    title: "Envíos a toda Colombia",
    description:
      "Recibe tus accesorios en cualquier ciudad del país y coordina entregas locales en Medellín y sus alrededores.",
  },
] as const;

const categoryStyles = [
  "bg-brand-soft text-foreground",
  "bg-surface-muted text-foreground",
  "bg-foreground text-white",
] as const;

export default async function Home() {
  const [categories, catalog] = await Promise.all([
    catalogService.listCategories(),
    catalogService.listProducts({ page: 1, pageSize: 4, sort: "featured" }),
  ]);
  return (
    <main className="flex-1 overflow-hidden">
      <section className="bg-foreground relative isolate overflow-hidden text-white">
        <div
          aria-hidden="true"
          className="hero-ambient bg-brand/15 absolute top-1/2 right-[12%] -z-10 size-[28rem] -translate-y-1/2 rounded-full blur-[110px]"
        />
        <div
          aria-hidden="true"
          className="border-brand/15 absolute -top-36 -right-48 -z-10 size-[34rem] rounded-full border-[1px] sm:size-[48rem]"
        />
        <div
          aria-hidden="true"
          className="border-brand/10 absolute -right-20 -bottom-64 -z-10 size-[38rem] rounded-full border-[1px]"
        />
        <div className="mx-auto grid min-h-[calc(100svh-7rem)] max-w-7xl gap-6 px-4 py-12 sm:px-6 sm:py-16 lg:min-h-[43rem] lg:grid-cols-[0.92fr_1.08fr] lg:items-center lg:py-20">
          <div className="relative z-10">
            <p className="text-brand inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-semibold tracking-[0.16em] uppercase">
              <span
                className="bg-accent size-2 rounded-full"
                aria-hidden="true"
              />
              Accesorios para tu celular
            </p>
            <h1 className="font-display mt-6 max-w-3xl text-[clamp(2.8rem,8vw,5.7rem)] leading-[0.96] font-bold tracking-[-0.055em] text-balance">
              Energía que
              <span className="text-brand"> te conecta.</span>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-slate-300 sm:text-lg sm:leading-8">
              Cargadores, cables y audífonos para acompañar tu día, con pagos
              flexibles y envíos a toda Colombia.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/catalogo"
                className="bg-brand hover:bg-brand-dark text-foreground inline-flex min-h-12 items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition hover:-translate-y-0.5 hover:text-white"
              >
                Explorar productos
                <span aria-hidden="true">→</span>
              </Link>
              <Link
                href="/pedido"
                className="inline-flex min-h-12 items-center rounded-full border border-white/25 px-6 py-3 text-sm font-semibold text-white transition hover:border-white hover:bg-white/5"
              >
                Consultar pedido
              </Link>
            </div>
            <div className="mt-10 flex flex-wrap gap-x-7 gap-y-3 border-t border-white/10 pt-6 text-xs font-bold text-slate-300">
              <span>✓ Garantía por funcionamiento</span>
              <span>✓ Pagos flexibles</span>
              <span>✓ Envíos a toda Colombia</span>
            </div>
          </div>

          <div className="relative -mx-4 min-h-[23rem] w-[calc(100%+2rem)] sm:mx-auto sm:w-full lg:min-h-[38rem] lg:max-w-[46rem]">
            <div
              aria-hidden="true"
              className="border-brand/30 absolute top-[25%] right-[5%] bottom-[13%] left-[4%] -rotate-6 rounded-[50%] border shadow-[0_0_70px_rgb(18_199_199/0.12)]"
            />
            <div
              aria-hidden="true"
              className="border-accent/35 absolute top-[34%] right-[13%] bottom-[20%] left-[18%] rotate-12 rounded-[50%] border"
            />
            <div
              aria-hidden="true"
              className="hero-orbit border-brand/35 absolute top-[16%] left-[13%] z-10 size-20 rounded-full border"
            />
            <div
              aria-hidden="true"
              className="hero-spark bg-accent absolute top-[17%] right-[12%] z-10 size-2.5 rounded-full shadow-[0_0_24px_var(--accent)]"
            />
            <div className="hero-product-float absolute inset-0">
              <Image
                src="/images/hero-tech-cutout.webp"
                alt="Audífonos inalámbricos, estuche, cargador y cable flotando entre trazos de luz"
                fill
                priority
                sizes="(min-width: 1024px) 58vw, 110vw"
                className="scale-[1.12] object-contain object-center drop-shadow-2xl"
              />
            </div>
            <span className="bg-foreground/55 text-brand absolute right-[8%] bottom-[9%] z-10 rounded-full border border-white/15 px-3 py-1.5 text-[10px] font-semibold tracking-[0.12em] uppercase backdrop-blur-md">
              Sonido sin límites
            </span>
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
            description="Explora nuestras categorías y encuentra rápidamente ese accesorio que quieres renovar."
            action={
              <Link
                href="/catalogo"
                className="text-brand-dark hover:text-foreground inline-flex items-center gap-2 text-sm font-semibold"
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
                <span className="text-xs font-bold tracking-[0.16em] opacity-65">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="font-display mt-12 max-w-[80%] text-2xl font-bold tracking-[-0.035em]">
                  {category.name}
                </h3>
                <span className="absolute right-5 bottom-5 grid size-11 place-items-center rounded-full bg-white text-xl font-bold shadow-sm transition group-hover:translate-x-1">
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
              title="Elige tu próximo accesorio"
              description="Descubre los favoritos de la tienda y lleva hoy lo que necesitas para mantenerte conectado."
              action={
                <Link
                  href="/catalogo"
                  className="text-brand-dark hover:text-foreground inline-flex items-center gap-2 text-sm font-semibold"
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

      <section className="bg-brand text-foreground">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-8 sm:px-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-4">
            <span
              aria-hidden="true"
              className="bg-foreground grid size-12 shrink-0 place-items-center rounded-full text-xl text-white"
            >
              $
            </span>
            <div>
              <p className="text-xs font-semibold tracking-[0.15em] uppercase opacity-70">
                Medellín y Valle de Aburrá
              </p>
              <h2 className="font-display mt-1 text-2xl font-bold tracking-[-0.03em]">
                Paga en efectivo cuando recibas tu pedido.
              </h2>
              <p className="mt-1 text-sm opacity-75">
                Selecciona pago contraentrega al finalizar la compra.
              </p>
            </div>
          </div>
          <Link
            href="/catalogo"
            className="bg-foreground inline-flex min-h-11 w-fit items-center rounded-full px-5 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-0.5"
          >
            Comprar con contraentrega →
          </Link>
        </div>
      </section>

      <section
        aria-labelledby="benefits-title"
        className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20"
      >
        <SectionHeading
          eyebrow="Compra fácil"
          id="benefits-title"
          title="Pide hoy. Recibe donde estés."
          description="Compra tus accesorios, elige cómo pagar y recibe tu pedido en cualquier lugar de Colombia."
        />
        <div className="border-line mt-10 grid border-t md:grid-cols-3">
          {purchaseBenefits.map((benefit) => (
            <article
              key={benefit.title}
              className="border-line border-b py-7 md:border-r md:px-7 md:first:pl-0 md:last:border-r-0"
            >
              <span className="font-display text-brand/25 text-4xl font-bold">
                {benefit.number}
              </span>
              <h3 className="text-foreground mt-5 text-lg font-bold">
                {benefit.title}
              </h3>
              <p className="text-muted mt-2 text-sm leading-6">
                {benefit.description}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-accent text-foreground">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-12 sm:px-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-bold tracking-[0.16em] uppercase opacity-80">
              Todo lo que necesitas está aquí
            </p>
            <h2 className="font-display mt-2 text-3xl font-bold tracking-[-0.04em] sm:text-4xl">
              Renueva tus accesorios hoy.
            </h2>
          </div>
          <Link
            href="/catalogo"
            className="text-foreground inline-flex min-h-12 w-fit items-center rounded-full bg-white px-6 py-3 text-sm font-bold transition hover:-translate-y-0.5"
          >
            Ver productos →
          </Link>
        </div>
      </section>
    </main>
  );
}
