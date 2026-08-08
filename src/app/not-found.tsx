import Link from "next/link";

export default function NotFound() {
  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="mx-auto flex w-full max-w-3xl flex-1 items-center px-6 py-20 text-center"
    >
      <div className="border-line bg-surface w-full rounded-[2rem] border p-10 shadow-sm">
        <p className="text-brand-dark text-sm font-bold tracking-widest">404</p>
        <h1 className="font-display text-foreground mt-2 text-3xl font-bold">
          No encontramos esta página
        </h1>
        <p className="text-muted mt-3">
          El producto puede no estar disponible o la dirección cambió.
        </p>
        <Link
          href="/catalogo"
          className="bg-foreground hover:bg-brand-dark mt-6 inline-flex rounded-full px-5 py-3 text-sm font-semibold text-white transition"
        >
          Volver al catálogo
        </Link>
      </div>
    </main>
  );
}
