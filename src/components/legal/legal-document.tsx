import type { ReactNode } from "react";

import type { PublicStoreSettings } from "@/features/store/store-settings";

export function LegalDocument({
  children,
  settings,
  title,
  updatedAt,
}: {
  children: ReactNode;
  settings: PublicStoreSettings;
  title: string;
  updatedAt: string;
}) {
  return (
    <main className="flex-1 bg-slate-50">
      <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
        <p className="text-sm font-bold tracking-widest text-cyan-700 uppercase">
          Información legal
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
          {title}
        </h1>
        <p className="mt-3 text-sm text-slate-500">
          Última actualización: {updatedAt}
        </p>

        <section className="mt-8 rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="text-lg font-bold text-slate-950">
            Responsable y proveedor
          </h2>
          <dl className="mt-3 grid gap-2 text-sm text-slate-700">
            <div>
              <dt className="inline font-semibold">Nombre comercial: </dt>
              <dd className="inline">{settings.storeName}</dd>
            </div>
            {settings.legalName ? (
              <div>
                <dt className="inline font-semibold">
                  Nombre o razón social:{" "}
                </dt>
                <dd className="inline">{settings.legalName}</dd>
              </div>
            ) : null}
            {settings.taxId ? (
              <div>
                <dt className="inline font-semibold">Identificación: </dt>
                <dd className="inline">{settings.taxId}</dd>
              </div>
            ) : null}
            {settings.notificationAddress ? (
              <div>
                <dt className="inline font-semibold">
                  Dirección de notificación:{" "}
                </dt>
                <dd className="inline">{settings.notificationAddress}</dd>
              </div>
            ) : null}
            {settings.businessCity ? (
              <div>
                <dt className="inline font-semibold">Ubicación: </dt>
                <dd className="inline">{settings.businessCity}</dd>
              </div>
            ) : null}
            {settings.supportEmail ? (
              <div>
                <dt className="inline font-semibold">Correo: </dt>
                <dd className="inline">
                  <a
                    href={`mailto:${settings.supportEmail}`}
                    className="text-cyan-800 hover:underline"
                  >
                    {settings.supportEmail}
                  </a>
                </dd>
              </div>
            ) : null}
          </dl>
        </section>

        <div className="mt-8 space-y-8 text-sm leading-7 text-slate-700 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-slate-950 [&_h3]:font-bold [&_h3]:text-slate-950 [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-5">
          {children}
        </div>
      </article>
    </main>
  );
}
