import { asc, count, desc, eq } from "drizzle-orm";

import { getDb } from "..";
import {
  adminUsers,
  orderEvents,
  orderItems,
  orders,
  paymentEvents,
  payments,
} from "../schema";

export async function listAdminOrders(limit = 50) {
  const database = getDb();

  return database
    .select({
      createdAt: orders.createdAt,
      customerEmail: orders.customerEmail,
      customerName: orders.customerName,
      itemCount: count(orderItems.id),
      orderId: orders.id,
      orderStatus: orders.status,
      paymentId: payments.id,
      paymentMethod: payments.method,
      paymentStatus: payments.status,
      reference: orders.reference,
      reservationExpiresAt: orders.reservationExpiresAt,
      totalInCop: orders.totalInCop,
    })
    .from(orders)
    .innerJoin(payments, eq(payments.orderId, orders.id))
    .innerJoin(orderItems, eq(orderItems.orderId, orders.id))
    .groupBy(orders.id, payments.id)
    .orderBy(desc(orders.createdAt))
    .limit(Math.min(Math.max(limit, 1), 100));
}

export async function getAdminOrderById(orderId: string) {
  const database = getDb();
  const [order] = await database
    .select({
      addressSnapshot: orders.addressSnapshot,
      createdAt: orders.createdAt,
      customerEmail: orders.customerEmail,
      customerName: orders.customerName,
      customerPhone: orders.customerPhone,
      id: orders.id,
      paymentId: payments.id,
      paymentMethod: payments.method,
      paymentStatus: payments.status,
      reference: orders.reference,
      reservationExpiresAt: orders.reservationExpiresAt,
      shippingInCop: orders.shippingInCop,
      shippingMethodName: orders.shippingMethodName,
      status: orders.status,
      subtotalInCop: orders.subtotalInCop,
      totalInCop: orders.totalInCop,
    })
    .from(orders)
    .innerJoin(payments, eq(payments.orderId, orders.id))
    .where(eq(orders.id, orderId))
    .limit(1);

  if (!order) return null;

  const [items, orderHistory, paymentHistory] = await Promise.all([
    database
      .select({
        id: orderItems.id,
        lineTotalInCop: orderItems.lineTotalInCop,
        productName: orderItems.productName,
        quantity: orderItems.quantity,
        sku: orderItems.sku,
        unitPriceInCop: orderItems.unitPriceInCop,
        variantName: orderItems.variantName,
      })
      .from(orderItems)
      .where(eq(orderItems.orderId, order.id))
      .orderBy(asc(orderItems.createdAt)),
    database
      .select({
        actorName: adminUsers.fullName,
        createdAt: orderEvents.createdAt,
        eventType: orderEvents.eventType,
        fromStatus: orderEvents.fromStatus,
        id: orderEvents.id,
        notes: orderEvents.notes,
        toStatus: orderEvents.toStatus,
      })
      .from(orderEvents)
      .leftJoin(adminUsers, eq(orderEvents.actorAdminId, adminUsers.id))
      .where(eq(orderEvents.orderId, order.id))
      .orderBy(asc(orderEvents.createdAt)),
    database
      .select({
        actorName: adminUsers.fullName,
        createdAt: paymentEvents.createdAt,
        eventType: paymentEvents.eventType,
        id: paymentEvents.id,
      })
      .from(paymentEvents)
      .leftJoin(adminUsers, eq(paymentEvents.actorAdminId, adminUsers.id))
      .where(eq(paymentEvents.paymentId, order.paymentId))
      .orderBy(asc(paymentEvents.createdAt)),
  ]);

  return { ...order, items, orderHistory, paymentHistory };
}
