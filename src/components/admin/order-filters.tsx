import Link from "next/link";

import type { AdminOrderFilters } from "@/features/admin/admin-order-filters";

const inputClass =
  "h-11 min-w-0 rounded-xl border border-line bg-surface px-3 text-sm text-foreground outline-none focus:border-brand";

export function OrderFilters({ filters }: { filters: AdminOrderFilters }) {
  return (
    <form className="border-line bg-surface mt-7 grid gap-3 rounded-2xl border p-4 lg:grid-cols-[1fr_190px_190px_auto]">
      <label className="grid min-w-0 gap-1 text-xs font-bold text-slate-600">
        Buscar pedido o cliente
        <input
          className={inputClass}
          defaultValue={filters.query ?? ""}
          maxLength={120}
          name="query"
          placeholder="Referencia, nombre o correo"
        />
      </label>
      <label className="grid gap-1 text-xs font-bold text-slate-600">
        Estado del pedido
        <select
          className={inputClass}
          defaultValue={filters.orderStatus ?? ""}
          name="orderStatus"
        >
          <option value="">Todos</option>
          <option value="pending">Pendiente</option>
          <option value="confirmed">Confirmado</option>
          <option value="preparing">Preparando</option>
          <option value="shipped">Enviado</option>
          <option value="delivered">Entregado</option>
          <option value="cancelled">Cancelado</option>
        </select>
      </label>
      <label className="grid gap-1 text-xs font-bold text-slate-600">
        Estado del pago
        <select
          className={inputClass}
          defaultValue={filters.paymentStatus ?? ""}
          name="paymentStatus"
        >
          <option value="">Todos</option>
          <option value="pending">Pendiente</option>
          <option value="approved">Aprobado</option>
          <option value="declined">Rechazado</option>
          <option value="voided">Anulado</option>
          <option value="refunded">Reembolsado</option>
        </select>
      </label>
      <div className="flex items-end gap-2">
        <button
          className="bg-foreground hover:bg-brand-dark h-11 rounded-xl px-5 text-sm font-bold text-white transition"
          type="submit"
        >
          Filtrar
        </button>
        <Link
          className="border-line hover:border-brand grid h-11 place-items-center rounded-xl border px-4 text-sm font-bold transition"
          href="/admin/pedidos"
        >
          Limpiar
        </Link>
      </div>
    </form>
  );
}
