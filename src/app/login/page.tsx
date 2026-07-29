import type { Metadata } from "next";

import { LoginForm } from "@/components/admin/login-form";
import { BrandMark } from "@/components/ui/brand-mark";
import { getSupabasePublicConfig } from "@/config/supabase";
import { privatePageRobots } from "@/features/seo/metadata";

export const metadata: Metadata = {
  robots: privatePageRobots,
  title: "Acceso administrativo",
};
export const dynamic = "force-dynamic";

export default function LoginPage() {
  const isConfigured = getSupabasePublicConfig() !== null;

  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="bg-brand-navy flex min-h-screen items-center justify-center px-4 py-12"
    >
      <section className="bg-surface w-full max-w-md rounded-3xl p-6 shadow-2xl sm:p-8">
        <BrandMark />
        <p className="text-brand-dark mt-8 text-xs font-extrabold tracking-[0.16em] uppercase">
          Acceso seguro
        </p>
        <h1 className="font-display text-foreground mt-2 text-3xl font-extrabold">
          Panel administrativo
        </h1>
        <p className="text-muted mt-3 text-sm leading-6">
          Ingresa con tu cuenta para gestionar pedidos, productos e inventario.
        </p>
        {isConfigured ? (
          <LoginForm />
        ) : (
          <div className="mt-8 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
            Supabase Auth aún no está configurado. Añade la URL del proyecto y
            su llave publicable en <code>.env.local</code> para habilitar el
            acceso.
          </div>
        )}
      </section>
    </main>
  );
}
