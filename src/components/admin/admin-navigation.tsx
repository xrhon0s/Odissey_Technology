"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navigationItems = [
  {
    href: "/admin",
    label: "Resumen",
    icon: "M4 13h6V4H4v9Zm0 7h6v-5H4v5Zm10 0h6v-9h-6v9Zm0-16v5h6V4h-6Z",
  },
  {
    href: "/admin/pedidos",
    label: "Pedidos",
    icon: "M6 3h12l2 4-2 4H6L4 7l2-4Zm0 8v10m12-10v10M8 15h8",
  },
  {
    href: "/admin/inventario",
    label: "Inventario",
    icon: "m4 7 8-4 8 4-8 4-8-4Zm0 0v10l8 4 8-4V7m-8 4v10",
  },
  {
    href: "/admin/productos",
    label: "Productos",
    icon: "M4 5h16v14H4V5Zm4 0v14m4-10h5m-5 4h5",
  },
  {
    href: "/admin/configuracion",
    label: "Configuración",
    icon: "M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Zm8-3.5 2-1-2-4-2 .5-1.5-1L16 3h-4l-.5 3.5-1.5 1L8 7 6 11l2 1v2l-2 1 2 4 2-.5 1.5 1L12 23h4l.5-3.5 1.5-1 2 .5 2-4-2-1v-2Z",
  },
] as const;

function isCurrentPath(pathname: string, href: string) {
  return href === "/admin"
    ? pathname === href
    : pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminNavigation({ compact = false }: { compact?: boolean }) {
  const pathname = usePathname();

  return (
    <nav aria-label="Administración">
      <ul
        className={compact ? "flex min-w-max gap-1 px-4 py-2" : "grid gap-1.5"}
      >
        {navigationItems.map((item) => {
          const isCurrent = isCurrentPath(pathname, item.href);

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={isCurrent ? "page" : undefined}
                className={`flex items-center gap-3 rounded-xl text-sm font-semibold transition ${
                  compact ? "px-3 py-2" : "px-3 py-3"
                } ${
                  isCurrent
                    ? compact
                      ? "bg-brand-soft text-foreground"
                      : "bg-brand text-foreground"
                    : compact
                      ? "text-muted hover:bg-surface-muted hover:text-foreground"
                      : "text-slate-300 hover:bg-white/8 hover:text-white"
                }`}
              >
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="size-4 shrink-0"
                >
                  <path d={item.icon} />
                </svg>
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
