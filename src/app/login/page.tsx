import type { Metadata } from "next";

import { LoginForm } from "@/components/admin/login-form";
import { getSupabasePublicConfig } from "@/config/supabase";

export const metadata: Metadata = { title: "Acceso administrativo" };
export const dynamic = "force-dynamic";

export default function LoginPage() {
  const isConfigured = getSupabasePublicConfig() !== null;

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-12">
      <section className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl sm:p-8">
        <p className="text-sm font-bold tracking-widest text-cyan-700 uppercase">
          Odissey Technology
        </p>
        <h1 className="mt-2 text-3xl font-bold text-slate-950">
          Panel administrativo
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Acceso exclusivo para administradores autorizados.
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
