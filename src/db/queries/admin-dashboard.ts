import { and, count, eq, lte, sql } from "drizzle-orm";

import { getDb } from "..";
import {
  inventory,
  orders,
  payments,
  products,
  productVariants,
} from "../schema";

export async function getAdminDashboardMetrics() {
  const database = getDb();
  const availableQuantity = sql<number>`${inventory.quantity} - ${inventory.reservedQuantity}`;

  const [
    [pendingOrders],
    [pendingPayments],
    [lowStockVariants],
    [approvedRevenue],
    [activeProducts],
  ] = await Promise.all([
    database
      .select({ value: count() })
      .from(orders)
      .where(eq(orders.status, "pending")),
    database
      .select({ value: count() })
      .from(payments)
      .where(eq(payments.status, "pending")),
    database
      .select({ value: count() })
      .from(inventory)
      .innerJoin(productVariants, eq(inventory.variantId, productVariants.id))
      .innerJoin(products, eq(productVariants.productId, products.id))
      .where(
        and(
          eq(productVariants.isActive, true),
          eq(products.status, "active"),
          lte(availableQuantity, inventory.lowStockThreshold),
        ),
      ),
    database
      .select({
        value: sql<number>`coalesce(sum(${payments.amountInCop}), 0)::integer`,
      })
      .from(payments)
      .where(eq(payments.status, "approved")),
    database
      .select({ value: count() })
      .from(products)
      .where(eq(products.status, "active")),
  ]);

  return {
    activeProducts: activeProducts?.value ?? 0,
    approvedRevenueInCop: approvedRevenue?.value ?? 0,
    lowStockVariants: lowStockVariants?.value ?? 0,
    pendingOrders: pendingOrders?.value ?? 0,
    pendingPayments: pendingPayments?.value ?? 0,
  };
}
