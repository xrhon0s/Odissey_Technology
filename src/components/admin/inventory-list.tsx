import { InventoryAdjustmentForm } from "./inventory-adjustment-form";

type InventoryRow = {
  availableQuantity: number;
  inventoryId: string;
  isVariantActive: boolean;
  lowStockThreshold: number;
  productName: string;
  quantity: number;
  reservedQuantity: number;
  sku: string;
  updatedAt: Date;
  variantId: string;
  variantName: string;
};

export function InventoryList({ items }: { items: InventoryRow[] }) {
  if (items.length === 0) {
    return (
      <div className="border-line bg-surface rounded-2xl border border-dashed px-6 py-16 text-center">
        <p className="font-display text-foreground text-lg font-extrabold">
          No hay variantes para controlar
        </p>
        <p className="text-muted mt-2 text-sm">
          Crea un producto con inventario y aparecerá automáticamente aquí.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {items.map((item) => {
        const isLowStock = item.availableQuantity <= item.lowStockThreshold;

        return (
          <article
            key={item.inventoryId}
            className={`bg-surface rounded-2xl border p-5 shadow-sm sm:p-6 ${isLowStock ? "border-brand-yellow" : "border-line"}`}
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-display text-foreground font-extrabold">
                    {item.productName} · {item.variantName}
                  </h2>
                  {isLowStock && (
                    <span className="bg-brand-yellow/25 rounded-full px-2.5 py-1 text-xs font-bold text-amber-900">
                      Requiere atención
                    </span>
                  )}
                  {!item.isVariantActive && (
                    <span className="rounded-full bg-slate-200 px-2.5 py-1 text-xs font-bold text-slate-700">
                      Inactiva
                    </span>
                  )}
                </div>
                <p className="text-muted mt-1 text-xs">SKU: {item.sku}</p>
              </div>
              <dl className="grid grid-cols-3 gap-2 text-center text-sm sm:gap-3">
                <div>
                  <dt className="text-muted text-xs">Total</dt>
                  <dd className="bg-canvas text-foreground mt-1 rounded-lg px-3 py-2 font-bold">
                    {item.quantity}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted text-xs">Reservado</dt>
                  <dd className="bg-canvas text-foreground mt-1 rounded-lg px-3 py-2 font-bold">
                    {item.reservedQuantity}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted text-xs">Disponible</dt>
                  <dd
                    className={`mt-1 rounded-lg px-3 py-2 font-bold ${isLowStock ? "bg-brand-yellow/25 text-amber-900" : "bg-brand/10 text-brand-dark"}`}
                  >
                    {item.availableQuantity}
                  </dd>
                </div>
              </dl>
            </div>
            <InventoryAdjustmentForm
              currentQuantity={item.quantity}
              variantId={item.variantId}
            />
          </article>
        );
      })}
    </div>
  );
}
