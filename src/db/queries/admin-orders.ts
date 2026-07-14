import { count, desc, eq } from "drizzle-orm";

import { getDb } from "..";
import { orderItems, orders, payments } from "../schema";

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
