import Link from "next/link";

export default function Home() {
  return (
    <main className="flex flex-1 items-center bg-slate-950 px-6 py-20 text-white">
      <div className="mx-auto w-full max-w-6xl">
        <p className="mb-4 text-sm font-semibold tracking-[0.24em] text-cyan-300 uppercase">
          Odissey Technology
        </p>
        <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-balance sm:text-6xl">
          Tecnología útil para acompañar tu día.
        </h1>
        <p className="mt-6 max-w-xl text-lg leading-8 text-slate-300">
          Accesorios seleccionados, precios claros y una experiencia hecha para
          Colombia.
        </p>
        <Link
          href="/catalogo"
          className="mt-8 inline-flex rounded-xl bg-cyan-400 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-300"
        >
          Explorar catálogo
        </Link>
      </div>
    </main>
  );
}
