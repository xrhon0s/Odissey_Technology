import Link from "next/link";

import { getPublicStoreSettings } from "@/db/queries/store-settings";
import { buildWhatsAppUrl } from "@/features/store/store-settings";
import { BrandMark } from "@/components/ui/brand-mark";

export async function SiteFooter() {
  const settings = await getPublicStoreSettings();
  const whatsappUrl = buildWhatsAppUrl(settings);

  return (
    <footer className="bg-foreground mt-auto px-6 pt-14 pb-8 text-sm text-slate-300">
      <div className="mx-auto mb-12 grid max-w-7xl gap-px overflow-hidden rounded-[1.5rem] border border-white/10 bg-white/10 sm:grid-cols-3">
        {[
          ["Envíos nacionales", "Recibe en cualquier ciudad de Colombia"],
          ["Pagos flexibles", "Nequi, DaviPlata, Bancolombia y efectivo"],
          ["Contraentrega local", "Disponible en Medellín y Valle de Aburrá"],
        ].map(([title, description]) => (
          <div key={title} className="bg-foreground p-5">
            <p className="text-brand font-bold">{title}</p>
            <p className="mt-1 text-xs leading-5 text-slate-400">
              {description}
            </p>
          </div>
        ))}
      </div>
      <div className="mx-auto grid max-w-7xl gap-10 sm:grid-cols-[1.2fr_0.8fr_1fr]">
        <div>
          <div className="text-white">
            <BrandMark inverse />
          </div>
          <p className="mt-5 max-w-xs leading-6 text-slate-400">
            Tecnología útil, atención cercana y entregas coordinadas desde
            Medellín para toda Colombia.
          </p>
          {settings.supportEmail ? (
            <a
              href={`mailto:${settings.supportEmail}`}
              className="hover:text-brand mt-4 inline-flex font-semibold text-white"
            >
              {settings.supportEmail}
            </a>
          ) : null}
        </div>
        <nav aria-label="Enlaces del pie de página">
          <p className="mb-4 text-xs font-bold tracking-[0.18em] text-white uppercase">
            Explora
          </p>
          <ul className="grid gap-3">
            <li>
              <Link href="/catalogo" className="transition hover:text-white">
                Catálogo
              </Link>
            </li>
            <li>
              <Link href="/carrito" className="transition hover:text-white">
                Carrito
              </Link>
            </li>
            <li>
              <Link href="/pedido" className="transition hover:text-white">
                Consultar pedido
              </Link>
            </li>
            {whatsappUrl ? (
              <li>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-white"
                >
                  Contactar por WhatsApp
                </a>
              </li>
            ) : null}
          </ul>
        </nav>
        <nav aria-label="Información legal">
          <p className="mb-4 text-xs font-bold tracking-[0.18em] text-white uppercase">
            Información
          </p>
          <ul className="grid gap-3">
            <li>
              <Link href="/terminos-y-condiciones" className="hover:text-white">
                Términos y condiciones
              </Link>
            </li>
            <li>
              <Link href="/politica-de-privacidad" className="hover:text-white">
                Política de privacidad
              </Link>
            </li>
            <li>
              <Link
                href="/cambios-garantias-y-retracto"
                className="hover:text-white"
              >
                Cambios, garantías y retracto
              </Link>
            </li>
            <li>
              <Link href="/envios-y-entregas" className="hover:text-white">
                Envíos y entregas
              </Link>
            </li>
            <li>
              <a
                href="https://www.sic.gov.co/"
                target="_blank"
                rel="noreferrer"
                className="text-brand font-semibold hover:text-white"
              >
                Superintendencia de Industria y Comercio
              </a>
            </li>
          </ul>
        </nav>
      </div>
      <p className="mx-auto mt-10 max-w-7xl border-t border-slate-700 pt-6 text-xs text-slate-500">
        © {new Date().getFullYear()} {settings.storeName}
      </p>
      {whatsappUrl ? (
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noreferrer"
          aria-label={`Contactar a ${settings.storeName} por WhatsApp`}
          className="fixed right-4 bottom-4 z-40 inline-flex items-center gap-2 rounded-full bg-[#20b86a] px-4 py-3 font-bold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-[#159957]"
        >
          <span aria-hidden="true" className="size-2 rounded-full bg-white" />
          WhatsApp
        </a>
      ) : null}
    </footer>
  );
}
