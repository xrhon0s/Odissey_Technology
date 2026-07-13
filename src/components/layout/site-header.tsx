import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="bg-slate-950 px-4 py-2 text-center text-xs font-medium text-cyan-100">
        Envíos a toda Colombia
      </div>
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link
          href="/"
          className="text-lg font-black tracking-tight text-slate-950"
        >
          ODISSEY<span className="text-cyan-600">.</span>
        </Link>
        <nav aria-label="Navegación principal">
          <ul className="flex items-center gap-5 text-sm font-semibold text-slate-700">
            <li>
              <Link className="transition-colors hover:text-cyan-700" href="/">
                Inicio
              </Link>
            </li>
            <li>
              <Link
                className="transition-colors hover:text-cyan-700"
                href="/catalogo"
              >
                Catálogo
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
