import Link from "next/link";

import { CartStatusLink } from "@/components/cart/cart-status-link";
import { BrandMark } from "@/components/ui/brand-mark";
import { getPublicStoreSettings } from "@/db/queries/store-settings";
import { getCustomerIdentity } from "@/features/customers/customer-access";

export async function SiteHeader() {
  const [settings, customer] = await Promise.all([
    getPublicStoreSettings(),
    getCustomerIdentity(),
  ]);

  return (
    <header className="border-line/80 bg-surface/95 sticky top-0 z-50 border-b shadow-[0_1px_14px_rgb(7_26_51/0.04)] backdrop-blur-md">
      <div className="bg-brand text-foreground px-4 py-2 text-center text-[11px] font-semibold tracking-wide sm:text-xs">
        {settings.announcement}
      </div>
      <div className="mx-auto flex h-[4.5rem] max-w-7xl items-center justify-between gap-2 px-4 sm:gap-4 sm:px-6">
        <Link
          href="/"
          className="text-foreground shrink-0 transition-opacity hover:opacity-75"
        >
          <BrandMark />
        </Link>
        <nav
          aria-label="Navegación principal"
          className="hidden min-w-0 sm:block"
        >
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
                className="hover:bg-surface-muted rounded-full px-2.5 py-2 transition-colors sm:px-3"
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
              <AccountLink authenticated={Boolean(customer)} />
            </li>
            <li>
              <CartStatusLink />
            </li>
          </ul>
        </nav>
        <div className="flex items-center gap-1.5 sm:hidden">
          <AccountLink authenticated={Boolean(customer)} compact />
          <CartStatusLink />
        </div>
      </div>
      <nav
        aria-label="Navegación móvil"
        className="border-line/80 border-t px-3 sm:hidden"
      >
        <ul className="text-foreground grid grid-cols-3 text-center text-xs font-bold">
          <li>
            <Link
              className="hover:text-brand-dark block py-2.5 transition-colors"
              href="/"
            >
              Inicio
            </Link>
          </li>
          <li>
            <Link
              className="hover:text-brand-dark block py-2.5 transition-colors"
              href="/catalogo"
            >
              Catálogo
            </Link>
          </li>
          <li>
            <Link
              className="hover:text-brand-dark block py-2.5 transition-colors"
              href="/pedido"
            >
              Mis pedidos
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}

function AccountLink({
  authenticated,
  compact = false,
}: {
  authenticated: boolean;
  compact?: boolean;
}) {
  return (
    <Link
      aria-label={
        authenticated ? "Ir a mi cuenta" : "Acceder o crear mi cuenta"
      }
      className={`border-foreground/15 hover:border-brand hover:bg-brand-soft inline-flex h-11 items-center justify-center gap-2 rounded-full border font-bold transition-colors ${
        compact ? "px-3 text-xs" : "px-4 text-sm"
      }`}
      href={authenticated ? "/cuenta" : "/cuenta/acceder"}
    >
      <svg
        aria-hidden="true"
        className="size-4 shrink-0"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.9"
        viewBox="0 0 24 24"
      >
        <circle cx="12" cy="8" r="3.25" />
        <path d="M5.75 19c.65-3.1 2.75-4.75 6.25-4.75S17.6 15.9 18.25 19" />
      </svg>
      {compact ? "Cuenta" : "Mi cuenta"}
    </Link>
  );
}
