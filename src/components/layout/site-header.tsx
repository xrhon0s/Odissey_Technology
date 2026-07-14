import Link from "next/link";

import { CartStatusLink } from "@/components/cart/cart-status-link";
import { BrandMark } from "@/components/ui/brand-mark";
import { getPublicStoreSettings } from "@/db/queries/store-settings";

export async function SiteHeader() {
  const settings = await getPublicStoreSettings();

  return (
    <header className="border-line/80 bg-surface/95 sticky top-0 z-50 border-b backdrop-blur-md">
      <div className="bg-brand px-4 py-2 text-center text-[11px] font-bold tracking-wide text-white sm:text-xs">
        {settings.announcement}
      </div>
      <div className="mx-auto flex h-[4.5rem] max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link
          href="/"
          className="text-foreground shrink-0 transition-opacity hover:opacity-75"
        >
          <BrandMark />
          <span className="sr-only">{settings.storeName}</span>
        </Link>
        <nav aria-label="Navegación principal" className="min-w-0">
          <ul className="text-foreground flex items-center gap-1 text-sm font-bold sm:gap-2">
            <li>
              <Link
                className="hover:bg-surface-muted hidden rounded-full px-3 py-2 transition-colors sm:inline-flex"
                href="/"
              >
                Inicio
              </Link>
            </li>
            <li>
              <Link
                className="hover:bg-surface-muted rounded-full px-3 py-2 transition-colors"
                href="/catalogo"
              >
                Catálogo
              </Link>
            </li>
            <li>
              <Link
                className="hover:bg-surface-muted hidden rounded-full px-3 py-2 transition-colors md:inline-flex"
                href="/pedido"
              >
                Mi pedido
              </Link>
            </li>
            <li>
              <CartStatusLink />
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
