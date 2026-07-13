import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 items-center px-6 py-20 text-center">
      <div className="w-full">
        <p className="text-sm font-bold tracking-widest text-cyan-700">404</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-950">
          No encontramos esta página
        </h1>
        <p className="mt-3 text-slate-600">
          El producto puede no estar disponible o la dirección cambió.
        </p>
        <Link
          href="/catalogo"
          className="mt-6 inline-flex rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white"
        >
          Volver al catálogo
        </Link>
      </div>
    </main>
  );
}
