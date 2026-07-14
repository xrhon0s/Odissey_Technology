import Link from "next/link";

import { getPublicStoreSettings } from "@/db/queries/store-settings";
import { buildWhatsAppUrl } from "@/features/store/store-settings";

export async function SiteFooter() {
  const settings = await getPublicStoreSettings();
  const whatsappUrl = buildWhatsAppUrl(settings);

  return (
    <footer className="mt-auto border-t border-slate-200 bg-white px-6 py-10 text-sm text-slate-600">
      <div className="mx-auto grid max-w-6xl gap-8 sm:grid-cols-3">
        <div>
          <p className="font-bold text-slate-950">{settings.storeName}</p>
          <p className="mt-2">Accesorios tecnológicos en Colombia.</p>
          {settings.supportEmail ? (
            <a
              href={`mailto:${settings.supportEmail}`}
              className="mt-2 inline-flex font-semibold text-cyan-800 hover:underline"
            >
              {settings.supportEmail}
            </a>
          ) : null}
        </div>
        <nav aria-label="Enlaces del pie de página" className="sm:text-right">
          <ul className="grid gap-2">
            <li>
              <Link href="/catalogo" className="hover:text-cyan-800">
                Catálogo
              </Link>
            </li>
            <li>
              <Link href="/carrito" className="hover:text-cyan-800">
                Carrito
              </Link>
            </li>
            <li>
              <Link href="/pedido" className="hover:text-cyan-800">
                Consultar pedido
              </Link>
            </li>
            {whatsappUrl ? (
              <li>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-cyan-800"
                >
                  Contactar por WhatsApp
                </a>
              </li>
            ) : null}
          </ul>
        </nav>
        <nav aria-label="Información legal" className="sm:text-right">
          <ul className="grid gap-2">
            <li>
              <Link
                href="/terminos-y-condiciones"
                className="hover:text-cyan-800"
              >
                Términos y condiciones
              </Link>
            </li>
            <li>
              <Link
                href="/politica-de-privacidad"
                className="hover:text-cyan-800"
              >
                Política de privacidad
              </Link>
            </li>
            <li>
              <Link
                href="/cambios-garantias-y-retracto"
                className="hover:text-cyan-800"
              >
                Cambios, garantías y retracto
              </Link>
            </li>
            <li>
              <Link href="/envios-y-entregas" className="hover:text-cyan-800">
                Envíos y entregas
              </Link>
            </li>
            <li>
              <a
                href="https://www.sic.gov.co/"
                target="_blank"
                rel="noreferrer"
                className="font-semibold text-cyan-800 hover:underline"
              >
                Superintendencia de Industria y Comercio
              </a>
            </li>
          </ul>
        </nav>
      </div>
      <p className="mx-auto mt-8 max-w-6xl border-t border-slate-200 pt-5 text-xs">
        © {new Date().getFullYear()} {settings.storeName}
      </p>
      {whatsappUrl ? (
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noreferrer"
          aria-label={`Contactar a ${settings.storeName} por WhatsApp`}
          className="fixed right-4 bottom-4 z-40 rounded-full bg-emerald-600 px-4 py-3 font-bold text-white shadow-lg transition hover:bg-emerald-700"
        >
          WhatsApp
        </a>
      ) : null}
    </footer>
  );
}
