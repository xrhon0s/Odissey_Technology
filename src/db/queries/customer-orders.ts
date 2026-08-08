import { and, asc, desc, eq } from "drizzle-orm";

import { getEffectiveOrderState } from "@/features/orders/order-lookup";

import { getDb } from "..";
import { orderItems, orders, payments } from "../schema";

export async function listCustomerOrders(customerId: string, limit = 30) {
  const rows = await getDb()
    .select({
      createdAt: orders.createdAt,
      id: orders.id,
      paymentStatus: payments.status,
      reference: orders.reference,
      reservationExpiresAt: orders.reservationExpiresAt,
      shippingMethodName: orders.shippingMethodName,
      status: orders.status,
      totalInCop: orders.totalInCop,
    })
    .from(orders)
    .innerJoin(payments, eq(payments.orderId, orders.id))
    .where(eq(orders.customerId, customerId))
    .orderBy(desc(orders.createdAt))
    .limit(Math.min(Math.max(limit, 1), 100));

  return rows.map((order) => ({
    ...order,
    ...getEffectiveOrderState(order),
  }));
}

export async function getCustomerOrderById(
  customerId: string,
  orderId: string,
) {
  const database = getDb();
  const [order] = await database
    .select({
      createdAt: orders.createdAt,
      estimatedDeliveryAt: orders.estimatedDeliveryAt,
      id: orders.id,
      paymentMethod: payments.method,
      paymentStatus: payments.status,
      reference: orders.reference,
      reservationExpiresAt: orders.reservationExpiresAt,
      shippingCarrier: orders.shippingCarrier,
      shippingInCop: orders.shippingInCop,
      shippingMethodName: orders.shippingMethodName,
      status: orders.status,
      subtotalInCop: orders.subtotalInCop,
      trackingNumber: orders.trackingNumber,
      trackingUrl: orders.trackingUrl,
      totalInCop: orders.totalInCop,
    })
    .from(orders)
    .innerJoin(payments, eq(payments.orderId, orders.id))
    .where(and(eq(orders.id, orderId), eq(orders.customerId, customerId)))
    .limit(1);

  if (!order) return null;

  const items = await database
    .select({
      id: orderItems.id,
      lineTotalInCop: orderItems.lineTotalInCop,
      productName: orderItems.productName,
      quantity: orderItems.quantity,
      variantName: orderItems.variantName,
    })
    .from(orderItems)
    .where(eq(orderItems.orderId, order.id))
    .orderBy(asc(orderItems.createdAt));

  return {
    ...order,
    ...getEffectiveOrderState(order),
    items,
  };
}
