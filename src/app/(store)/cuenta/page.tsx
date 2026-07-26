import type { Metadata } from "next";
import Link from "next/link";

import { customerLogoutAction } from "./actions";

import { CustomerProfileForm } from "@/components/customers/customer-profile-form";
import { listCustomerOrders } from "@/db/queries/customer-orders";
import { requireCustomer } from "@/features/customers/customer-access";
import { formatCurrency } from "@/lib/format-currency";

export const metadata: Metadata = { title: "Mi cuenta" };
export const dynamic = "force-dynamic";

const statusLabels: Record<string, string> = {
  cancelled: "Cancelado",
  confirmed: "Confirmado",
  delivered: "Entregado",
  pending: "Pendiente",
  preparing: "En preparación",
  shipped: "Enviado",
};

export default async function CustomerAccountPage() {
  const customer = await requireCustomer();
  const customerOrders = await listCustomerOrders(customer.id);

  return (
    <main id="main-content" tabIndex={-1} className="bg-background flex-1">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-brand-dark text-xs font-semibold tracking-[0.18em] uppercase">
              Mi cuenta
            </p>
            <h1 className="font-display text-foreground mt-2 text-4xl font-bold tracking-[-0.04em] sm:text-5xl">
              Hola, {customer.fullName.split(" ")[0]}
            </h1>
            <p className="text-muted mt-2">{customer.email}</p>
          </div>
          <form action={customerLogoutAction}>
            <button
              className="border-line bg-surface hover:border-brand rounded-full border px-5 py-2.5 text-sm font-bold transition"
              type="submit"
            >
              Cerrar sesión
            </button>
          </form>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
          <section>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-display text-foreground text-2xl font-bold">
                  Mis pedidos
                </h2>
                <p className="text-muted mt-1 text-sm">
                  Aquí aparecen las compras realizadas con la sesión iniciada.
                </p>
              </div>
              <Link
                className="bg-brand text-foreground hover:bg-brand-dark rounded-full px-5 py-2.5 text-sm font-bold transition hover:text-white"
                href="/catalogo"
              >
                Seguir comprando
              </Link>
            </div>

            {customerOrders.length > 0 ? (
              <div className="mt-5 grid gap-3">
                {customerOrders.map((order) => (
                  <Link
                    className="border-line bg-surface hover:border-brand group grid gap-4 rounded-2xl border p-5 transition sm:grid-cols-[1fr_auto] sm:items-center"
                    href={`/cuenta/pedidos/${order.id}`}
                    key={order.id}
                  >
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-brand-dark font-mono text-sm font-bold">
                          {order.reference}
                        </p>
                        <span className="bg-surface-muted rounded-full px-2.5 py-1 text-xs font-semibold">
                          {statusLabels[order.status] ?? order.status}
                        </span>
                      </div>
                      <p className="text-muted mt-2 text-sm">
                        {new Date(order.createdAt).toLocaleDateString("es-CO", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                        {" · "}
                        {order.shippingMethodName}
                      </p>
                    </div>
                    <div className="flex items-center justify-between gap-4 sm:block sm:text-right">
                      <p className="font-display text-foreground text-lg font-bold">
                        {formatCurrency(order.totalInCop)}
                      </p>
                      <span className="text-brand-dark text-sm font-bold">
                        Ver detalle →
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="border-line bg-surface mt-5 rounded-2xl border border-dashed p-8">
                <h3 className="font-display text-foreground text-xl font-bold">
                  Aún no hay pedidos vinculados
                </h3>
                <p className="text-muted mt-2 max-w-xl leading-7">
                  Tu próxima compra aparecerá aquí si la realizas con esta
                  sesión iniciada. Para una compra anterior, usa la consulta por
                  referencia y correo.
                </p>
                <Link
                  className="text-brand-dark mt-4 inline-flex text-sm font-bold"
                  href="/pedido"
                >
                  Consultar una compra anterior →
                </Link>
              </div>
            )}
          </section>

          <aside className="border-line bg-surface rounded-2xl border p-5">
            <h2 className="font-display text-foreground text-xl font-bold">
              Mis datos
            </h2>
            <p className="text-muted mt-1 text-sm leading-6">
              Se usarán para completar más rápido tus próximas compras.
            </p>
            <CustomerProfileForm
              fullName={customer.fullName}
              phone={customer.phone}
            />
          </aside>
        </div>
      </div>
    </main>
  );
}
