import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { CustomerAuthForms } from "@/components/customers/customer-auth-forms";
import { getCustomerIdentity } from "@/features/customers/customer-access";
import { customerReturnPathSchema } from "@/features/customers/customer-auth";

export const metadata: Metadata = {
  title: "Cuenta de cliente",
  description: "Accede a tus compras y datos en Odissey Technology.",
};
export const dynamic = "force-dynamic";

export default async function CustomerAccessPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const query = await searchParams;
  const nextPath = customerReturnPathSchema.parse(query.next);
  if (await getCustomerIdentity()) redirect(nextPath);

  return (
    <main id="main-content" tabIndex={-1} className="bg-background flex-1">
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
        <p className="text-brand-dark flex items-center gap-2 text-xs font-semibold tracking-[0.18em] uppercase">
          <span
            className="bg-accent h-0.5 w-5 rounded-full"
            aria-hidden="true"
          />
          Tu espacio
        </p>
        <h1 className="font-display text-foreground mt-3 text-4xl font-bold tracking-[-0.045em] sm:text-5xl">
          Compra con menos pasos.
        </h1>
        <p className="text-muted mt-3 mb-8 max-w-2xl leading-7">
          Guarda tus datos y encuentra tus pedidos vinculados en un solo lugar.
          Crear una cuenta nunca será obligatorio para comprar.
        </p>
        <CustomerAuthForms nextPath={nextPath} />
      </div>
    </main>
  );
}
