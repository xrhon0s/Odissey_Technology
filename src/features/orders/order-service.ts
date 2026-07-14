import { createHash, randomUUID } from "node:crypto";

import { and, eq, inArray, lt, sql } from "drizzle-orm";

import { getDb } from "@/db";
import {
  inventory,
  orderEvents,
  orderItems,
  orders,
  paymentEvents,
  payments,
  products,
  productVariants,
  shippingMethods,
} from "@/db/schema";
import {
  createCheckoutQuote,
  type CheckoutQuoteRepository,
} from "@/features/checkout/checkout-service";
import type { ManualPaymentMethod } from "@/features/payments/payment-methods";

import type { CreateOrderRequest } from "./order-schema";

const RESERVATION_DURATION_IN_MINUTES = 30;

type OrderTransaction = Parameters<
  Parameters<ReturnType<typeof getDb>["transaction"]>[0]
>[0];

export type PendingOrderResult = {
  id: string;
  paymentMethod: ManualPaymentMethod;
  paymentStatus: "pending";
  reference: string;
  reservationExpiresAt: Date;
  reused: boolean;
  status: "pending";
  totalInCop: number;
};

export class OrderCreationError extends Error {
  constructor(
    public readonly code: "IDEMPOTENCY_CONFLICT",
    message: string,
  ) {
    super(message);
    this.name = "OrderCreationError";
  }
}

export function createOrderRequestFingerprint(input: CreateOrderRequest) {
  const {
    acceptedTerms,
    address,
    customer,
    items,
    paymentMethod,
    privacyPolicyVersion,
    shippingMethodCode,
    termsVersion,
  } = input.checkout;
  const canonicalPayload = {
    acceptedTerms,
    address: address
      ? {
          addressLine1: address.addressLine1,
          addressLine2: address.addressLine2 ?? null,
          city: address.city,
          deliveryNotes: address.deliveryNotes ?? null,
          department: address.department,
          neighborhood: address.neighborhood ?? null,
        }
      : null,
    customer: {
      email: customer.email,
      fullName: customer.fullName,
      phone: customer.phone,
    },
    items: [...items]
      .sort((left, right) => left.variantId.localeCompare(right.variantId))
      .map(({ quantity, variantId }) => ({ quantity, variantId })),
    paymentMethod,
    privacyPolicyVersion,
    shippingMethodCode,
    termsVersion,
  };

  return createHash("sha256")
    .update(JSON.stringify(canonicalPayload))
    .digest("hex");
}

function createOrderReference() {
  const timestamp = Date.now().toString(36).toUpperCase();
  const randomSuffix = randomUUID().slice(0, 8).toUpperCase();

  return `OD-${timestamp}-${randomSuffix}`;
}

async function releaseExpiredReservations(
  transaction: OrderTransaction,
  now: Date,
) {
  const expiredOrders = await transaction
    .select({ id: orders.id })
    .from(orders)
    .where(
      and(eq(orders.status, "pending"), lt(orders.reservationExpiresAt, now)),
    )
    .for("update", { skipLocked: true });

  if (expiredOrders.length === 0) return 0;

  const expiredOrderIds = expiredOrders.map((order) => order.id);
  const expiredItems = await transaction
    .select({
      quantity: orderItems.quantity,
      variantId: orderItems.variantId,
    })
    .from(orderItems)
    .where(inArray(orderItems.orderId, expiredOrderIds));

  for (const item of expiredItems) {
    await transaction
      .update(inventory)
      .set({
        reservedQuantity: sql`greatest(${inventory.reservedQuantity} - ${item.quantity}, 0)`,
        updatedAt: now,
      })
      .where(eq(inventory.variantId, item.variantId));
  }

  const expiredPayments = await transaction
    .select({ id: payments.id })
    .from(payments)
    .where(
      and(
        inArray(payments.orderId, expiredOrderIds),
        eq(payments.status, "pending"),
      ),
    );

  if (expiredPayments.length > 0) {
    const expiredPaymentIds = expiredPayments.map((payment) => payment.id);

    await transaction
      .update(payments)
      .set({ status: "voided", updatedAt: now })
      .where(inArray(payments.id, expiredPaymentIds));

    await transaction.insert(paymentEvents).values(
      expiredPaymentIds.map((paymentId) => ({
        eventType: "reservation_expired",
        paymentId,
        payload: { status: "voided" },
      })),
    );
  }

  await transaction
    .update(orders)
    .set({ status: "cancelled", updatedAt: now })
    .where(inArray(orders.id, expiredOrderIds));
  await transaction.insert(orderEvents).values(
    expiredOrderIds.map((orderId) => ({
      eventType: "reservation_expired",
      fromStatus: "pending" as const,
      orderId,
      toStatus: "cancelled" as const,
    })),
  );

  return expiredOrderIds.length;
}

export function releaseExpiredOrderReservations() {
  return getDb().transaction((transaction) =>
    releaseExpiredReservations(transaction, new Date()),
  );
}

export async function createPendingOrder(
  input: CreateOrderRequest,
): Promise<PendingOrderResult> {
  const requestFingerprint = createOrderRequestFingerprint(input);

  return getDb().transaction(async (transaction) => {
    const now = new Date();
    await releaseExpiredReservations(transaction, now);

    const [existingOrder] = await transaction
      .select({
        id: orders.id,
        paymentMethod: payments.method,
        paymentStatus: payments.status,
        reference: orders.reference,
        requestFingerprint: orders.requestFingerprint,
        reservationExpiresAt: orders.reservationExpiresAt,
        status: orders.status,
        totalInCop: orders.totalInCop,
      })
      .from(orders)
      .innerJoin(payments, eq(payments.orderId, orders.id))
      .where(eq(orders.checkoutAttemptId, input.checkoutAttemptId))
      .limit(1);

    if (existingOrder) {
      if (existingOrder.requestFingerprint !== requestFingerprint) {
        throw new OrderCreationError(
          "IDEMPOTENCY_CONFLICT",
          "Este intento de compra ya fue utilizado con otros datos.",
        );
      }

      if (
        existingOrder.status !== "pending" ||
        existingOrder.paymentStatus !== "pending" ||
        existingOrder.paymentMethod === "manual_transfer"
      ) {
        throw new OrderCreationError(
          "IDEMPOTENCY_CONFLICT",
          "Este intento de compra ya fue procesado.",
        );
      }

      return {
        id: existingOrder.id,
        paymentMethod: existingOrder.paymentMethod,
        paymentStatus: "pending",
        reference: existingOrder.reference,
        reservationExpiresAt: existingOrder.reservationExpiresAt,
        reused: true,
        status: "pending",
        totalInCop: existingOrder.totalInCop,
      };
    }

    const variantIds = input.checkout.items.map((item) => item.variantId);

    await transaction
      .select({ id: inventory.id })
      .from(inventory)
      .where(inArray(inventory.variantId, variantIds))
      .for("update");

    const quoteRepository: CheckoutQuoteRepository = {
      async findActiveShippingMethod(code) {
        const [method] = await transaction
          .select({
            code: shippingMethods.code,
            description: shippingMethods.description,
            name: shippingMethods.name,
            priceInCop: shippingMethods.priceInCop,
            requiresAddress: shippingMethods.requiresAddress,
          })
          .from(shippingMethods)
          .where(
            and(
              eq(shippingMethods.code, code),
              eq(shippingMethods.isActive, true),
            ),
          )
          .limit(1);

        return method ?? null;
      },
      findActiveVariants(requestedVariantIds) {
        return transaction
          .select({
            availableQuantity: sql<number>`greatest(${inventory.quantity} - ${inventory.reservedQuantity}, 0)::integer`,
            priceInCop: productVariants.priceInCop,
            productName: products.name,
            sku: productVariants.sku,
            variantId: productVariants.id,
            variantName: productVariants.name,
          })
          .from(productVariants)
          .innerJoin(products, eq(productVariants.productId, products.id))
          .innerJoin(inventory, eq(inventory.variantId, productVariants.id))
          .where(
            and(
              inArray(productVariants.id, requestedVariantIds),
              eq(productVariants.isActive, true),
              eq(products.status, "active"),
            ),
          );
      },
    };
    const quote = await createCheckoutQuote(input.checkout, quoteRepository);
    const reservationExpiresAt = new Date(
      Date.now() + RESERVATION_DURATION_IN_MINUTES * 60 * 1000,
    );
    const [createdOrder] = await transaction
      .insert(orders)
      .values({
        addressSnapshot: input.checkout.address ?? null,
        checkoutAttemptId: input.checkoutAttemptId,
        customerEmail: input.checkout.customer.email,
        customerName: input.checkout.customer.fullName,
        customerPhone: input.checkout.customer.phone,
        privacyPolicyVersion: input.checkout.privacyPolicyVersion,
        reference: createOrderReference(),
        requestFingerprint,
        reservationExpiresAt,
        shippingInCop: quote.shippingInCop,
        shippingMethodCode: quote.shippingMethod.code,
        shippingMethodName: quote.shippingMethod.name,
        subtotalInCop: quote.subtotalInCop,
        termsAcceptedAt: now,
        termsVersion: input.checkout.termsVersion,
        totalInCop: quote.totalInCop,
      })
      .returning({ id: orders.id, reference: orders.reference });

    if (!createdOrder) {
      throw new Error("Order insert did not return a record");
    }

    await transaction.insert(orderEvents).values({
      eventType: "created",
      orderId: createdOrder.id,
      toStatus: "pending",
    });

    await transaction.insert(orderItems).values(
      quote.items.map((item) => ({
        lineTotalInCop: item.lineTotalInCop,
        orderId: createdOrder.id,
        productName: item.productName,
        quantity: item.quantity,
        sku: item.sku,
        unitPriceInCop: item.priceInCop,
        variantId: item.variantId,
        variantName: item.variantName,
      })),
    );

    const [createdPayment] = await transaction
      .insert(payments)
      .values({
        amountInCop: quote.totalInCop,
        method: input.checkout.paymentMethod,
        orderId: createdOrder.id,
        reference: `PM-${createdOrder.reference}`,
      })
      .returning({ id: payments.id });

    if (!createdPayment) {
      throw new Error("Payment insert did not return a record");
    }

    await transaction.insert(paymentEvents).values({
      eventType: "created",
      paymentId: createdPayment.id,
      payload: { method: input.checkout.paymentMethod, status: "pending" },
    });

    for (const item of quote.items) {
      await transaction
        .update(inventory)
        .set({
          reservedQuantity: sql`${inventory.reservedQuantity} + ${item.quantity}`,
          updatedAt: new Date(),
        })
        .where(eq(inventory.variantId, item.variantId));
    }

    return {
      id: createdOrder.id,
      paymentMethod: input.checkout.paymentMethod,
      paymentStatus: "pending",
      reference: createdOrder.reference,
      reservationExpiresAt,
      reused: false,
      status: "pending",
      totalInCop: quote.totalInCop,
    };
  });
}
