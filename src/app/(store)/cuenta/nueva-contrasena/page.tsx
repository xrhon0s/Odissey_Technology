import type { Metadata } from "next";

import { PasswordUpdateForm } from "@/components/customers/password-forms";
import { requireCustomer } from "@/features/customers/customer-access";

export const metadata: Metadata = { title: "Nueva contraseña" };
export const dynamic = "force-dynamic";

export default async function NewPasswordPage() {
  await requireCustomer();

  return (
    <main id="main-content" tabIndex={-1} className="bg-background flex-1">
      <div className="mx-auto max-w-lg px-4 py-12 sm:px-6 sm:py-16">
        <section className="border-line bg-surface rounded-[1.75rem] border p-6 sm:p-8">
          <p className="text-brand-dark text-xs font-bold tracking-[0.16em] uppercase">
            Seguridad
          </p>
          <h1 className="font-display text-foreground mt-2 text-3xl font-bold">
            Define una contraseña nueva
          </h1>
          <p className="text-muted mt-3 leading-7">
            Usa mínimo 8 caracteres, con al menos una letra y un número.
          </p>
          <PasswordUpdateForm />
        </section>
      </div>
    </main>
  );
}
