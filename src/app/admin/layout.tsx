import Link from "next/link";

import { logoutAction } from "@/app/login/actions";
import { requireAdmin } from "@/features/admin/admin-access";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const admin = await requireAdmin();

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="border-b border-slate-800 bg-slate-950 text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div className="flex items-center gap-6">
            <div>
              <Link href="/admin" className="font-bold">
                Odissey Admin
              </Link>
              <p className="mt-1 text-xs text-slate-400">
                {admin.fullName} · {admin.role}
              </p>
            </div>
            <nav aria-label="Administración" className="hidden gap-4 sm:flex">
              <Link
                href="/admin"
                className="text-sm text-slate-300 hover:text-white"
              >
                Resumen
              </Link>
              <Link
                href="/admin/pedidos"
                className="text-sm text-slate-300 hover:text-white"
              >
                Pedidos
              </Link>
              <Link
                href="/admin/inventario"
                className="text-sm text-slate-300 hover:text-white"
              >
                Inventario
              </Link>
              <Link
                href="/admin/productos"
                className="text-sm text-slate-300 hover:text-white"
              >
                Productos
              </Link>
            </nav>
          </div>
          <form action={logoutAction}>
            <button
              type="submit"
              className="rounded-lg border border-slate-700 px-3 py-2 text-sm font-semibold hover:bg-slate-800"
            >
              Cerrar sesión
            </button>
          </form>
        </div>
        <nav
          aria-label="Administración móvil"
          className="mx-auto flex max-w-7xl gap-5 overflow-x-auto px-4 pb-4 text-sm sm:hidden"
        >
          <Link href="/admin" className="whitespace-nowrap text-slate-300">
            Resumen
          </Link>
          <Link
            href="/admin/pedidos"
            className="whitespace-nowrap text-slate-300"
          >
            Pedidos
          </Link>
          <Link
            href="/admin/inventario"
            className="whitespace-nowrap text-slate-300"
          >
            Inventario
          </Link>
          <Link
            href="/admin/productos"
            className="whitespace-nowrap text-slate-300"
          >
            Productos
          </Link>
        </nav>
      </header>
      {children}
    </div>
  );
}
