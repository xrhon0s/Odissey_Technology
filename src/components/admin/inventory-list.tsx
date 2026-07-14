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
  return (
    <div className="space-y-4">
      {items.map((item) => {
        const isLowStock = item.availableQuantity <= item.lowStockThreshold;

        return (
          <article
            key={item.inventoryId}
            className={`rounded-2xl border bg-white p-5 shadow-sm ${isLowStock ? "border-amber-300" : "border-slate-200"}`}
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-bold text-slate-950">
                    {item.productName} · {item.variantName}
                  </h2>
                  {isLowStock && (
                    <span className="rounded-full bg-amber-100 px-2 py-1 text-xs font-bold text-amber-900">
                      Poco inventario
                    </span>
                  )}
                  {!item.isVariantActive && (
                    <span className="rounded-full bg-slate-200 px-2 py-1 text-xs font-bold text-slate-700">
                      Inactiva
                    </span>
                  )}
                </div>
                <p className="mt-1 text-xs text-slate-500">SKU: {item.sku}</p>
              </div>
              <dl className="grid grid-cols-3 gap-5 text-right text-sm">
                <div>
                  <dt className="text-xs text-slate-500">Total</dt>
                  <dd className="mt-1 font-bold text-slate-950">
                    {item.quantity}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-500">Reservado</dt>
                  <dd className="mt-1 font-bold text-slate-950">
                    {item.reservedQuantity}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-500">Disponible</dt>
                  <dd className="mt-1 font-bold text-slate-950">
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
