import { asc, eq, sql } from "drizzle-orm";

import { getEffectiveOrderState } from "@/features/orders/order-lookup";

import { getDb } from "..";
import { orderItems, orders, payments } from "../schema";

export async function getPublicOrderStatus(reference: string, email: string) {
  const database = getDb();
  const [order] = await database
    .select({
      createdAt: orders.createdAt,
      id: orders.id,
      paymentMethod: payments.method,
      paymentStatus: payments.status,
      reference: orders.reference,
      reservationExpiresAt: orders.reservationExpiresAt,
      shippingInCop: orders.shippingInCop,
      shippingMethodName: orders.shippingMethodName,
      estimatedDeliveryAt: orders.estimatedDeliveryAt,
      shippingCarrier: orders.shippingCarrier,
      status: orders.status,
      subtotalInCop: orders.subtotalInCop,
      trackingNumber: orders.trackingNumber,
      trackingUrl: orders.trackingUrl,
      totalInCop: orders.totalInCop,
    })
    .from(orders)
    .innerJoin(payments, eq(payments.orderId, orders.id))
    .where(
      sql`${orders.reference} = ${reference} and lower(${orders.customerEmail}) = lower(${email.trim()})`,
    )
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
  const effectiveState = getEffectiveOrderState(order);

  return {
    createdAt: order.createdAt,
    estimatedDeliveryAt: order.estimatedDeliveryAt,
    items,
    paymentMethod: order.paymentMethod,
    paymentStatus: effectiveState.paymentStatus,
    reference: order.reference,
    reservationExpiresAt: order.reservationExpiresAt,
    shippingInCop: order.shippingInCop,
    shippingMethodName: order.shippingMethodName,
    shippingCarrier: order.shippingCarrier,
    status: effectiveState.status,
    subtotalInCop: order.subtotalInCop,
    trackingNumber: order.trackingNumber,
    trackingUrl: order.trackingUrl,
    totalInCop: order.totalInCop,
  };
}
