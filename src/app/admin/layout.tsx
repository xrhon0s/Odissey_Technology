import Link from "next/link";

import { logoutAction } from "@/app/login/actions";
import { AdminNavigation } from "@/components/admin/admin-navigation";
import { BrandMark } from "@/components/ui/brand-mark";
import { requireAdmin } from "@/features/admin/admin-access";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const admin = await requireAdmin();

  return (
    <div className="bg-background min-h-screen lg:grid lg:grid-cols-[264px_1fr]">
      <aside className="bg-foreground sticky top-0 hidden h-screen flex-col px-4 py-5 text-white lg:flex">
        <div className="px-2">
          <BrandMark inverse />
          <p className="text-brand mt-3 text-xs font-semibold tracking-[0.14em] uppercase">
            Panel administrativo
          </p>
        </div>

        <div className="mt-8 flex-1">
          <AdminNavigation />
        </div>

        <div className="border-t border-white/10 pt-4">
          <div className="mb-3 px-3">
            <p className="truncate text-sm font-semibold text-white">
              {admin.fullName}
            </p>
            <p className="mt-1 text-xs text-slate-400">
              {admin.role === "owner" ? "Propietario" : "Administrador"}
            </p>
          </div>
          <div className="grid gap-1">
            <Link
              href="/"
              className="rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-white/8 hover:text-white"
            >
              Ver tienda ↗
            </Link>
            <form action={logoutAction}>
              <button
                type="submit"
                className="w-full rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-slate-300 transition hover:bg-white/8 hover:text-white"
              >
                Cerrar sesión
              </button>
            </form>
          </div>
        </div>
      </aside>

      <div className="min-w-0">
        <header className="border-line bg-surface/95 sticky top-0 z-40 border-b backdrop-blur lg:hidden">
          <div className="flex h-16 items-center justify-between gap-4 px-4">
            <BrandMark />
            <div className="flex items-center gap-3">
              <Link href="/" className="text-brand-dark text-xs font-semibold">
                Ver tienda
              </Link>
              <form action={logoutAction}>
                <button
                  type="submit"
                  className="bg-foreground rounded-full px-3 py-2 text-xs font-semibold text-white"
                >
                  Salir
                </button>
              </form>
            </div>
          </div>
          <div className="border-line overflow-x-auto border-t">
            <AdminNavigation compact />
          </div>
        </header>
        {children}
      </div>
    </div>
  );
}
