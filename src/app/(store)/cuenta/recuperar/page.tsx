import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Recuperar cuenta" };

export default function PasswordRecoveryPage() {
  return (
    <main id="main-content" tabIndex={-1} className="bg-background flex-1">
      <div className="mx-auto max-w-lg px-4 py-12 sm:px-6 sm:py-16">
        <section className="border-line bg-surface rounded-[1.75rem] border p-6 sm:p-8">
          <p className="text-brand-dark text-xs font-bold tracking-[0.16em] uppercase">
            Acceso
          </p>
          <h1 className="font-display text-foreground mt-2 text-3xl font-bold">
            Recuperación no disponible
          </h1>
          <p className="text-muted mt-3 leading-7">
            En esta primera versión no enviaremos correos automáticos para
            recuperar contraseñas. Puedes seguir comprando como invitado sin
            necesidad de iniciar sesión.
          </p>
          <Link
            className="text-brand-dark mt-5 inline-flex text-sm font-bold"
            href="/cuenta/acceder"
          >
            ← Volver al acceso
          </Link>
        </section>
      </div>
    </main>
  );
}
