import { createHash, randomUUID } from "node:crypto";

import { and, eq, inArray, lt, sql } from "drizzle-orm";

import { getDb } from "@/db";
import {
  inventory,
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

import type { CreateOrderRequest } from "./order-schema";

const RESERVATION_DURATION_IN_MINUTES = 30;

export type PendingOrderResult = {
  id: string;
  paymentMethod: "manual_transfer";
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
  const { address, customer, items, shippingMethodCode } = input.checkout;
  const canonicalPayload = {
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
    shippingMethodCode,
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

export async function createPendingOrder(
  input: CreateOrderRequest,
): Promise<PendingOrderResult> {
  const requestFingerprint = createOrderRequestFingerprint(input);

  return getDb().transaction(async (transaction) => {
    const now = new Date();
    const expiredOrders = await transaction
      .select({ id: orders.id })
      .from(orders)
      .where(
        and(eq(orders.status, "pending"), lt(orders.reservationExpiresAt, now)),
      )
      .for("update", { skipLocked: true });

    if (expiredOrders.length > 0) {
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
            reservedQuantity: sql`${inventory.reservedQuantity} - ${item.quantity}`,
            updatedAt: now,
          })
          .where(eq(inventory.variantId, item.variantId));
      }

      await transaction
        .update(orders)
        .set({ status: "cancelled", updatedAt: now })
        .where(inArray(orders.id, expiredOrderIds));
    }

    const [existingOrder] = await transaction
      .select({
        id: orders.id,
        reference: orders.reference,
        requestFingerprint: orders.requestFingerprint,
        reservationExpiresAt: orders.reservationExpiresAt,
        status: orders.status,
        totalInCop: orders.totalInCop,
      })
      .from(orders)
      .where(eq(orders.checkoutAttemptId, input.checkoutAttemptId))
      .limit(1);

    if (existingOrder) {
      if (existingOrder.requestFingerprint !== requestFingerprint) {
        throw new OrderCreationError(
          "IDEMPOTENCY_CONFLICT",
          "Este intento de compra ya fue utilizado con otros datos.",
        );
      }

      if (existingOrder.status !== "pending") {
        throw new OrderCreationError(
          "IDEMPOTENCY_CONFLICT",
          "Este intento de compra ya fue procesado.",
        );
      }

      return {
        id: existingOrder.id,
        paymentMethod: "manual_transfer",
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
        reference: createOrderReference(),
        requestFingerprint,
        reservationExpiresAt,
        shippingInCop: quote.shippingInCop,
        shippingMethodCode: quote.shippingMethod.code,
        shippingMethodName: quote.shippingMethod.name,
        subtotalInCop: quote.subtotalInCop,
        totalInCop: quote.totalInCop,
      })
      .returning({ id: orders.id, reference: orders.reference });

    if (!createdOrder) {
      throw new Error("Order insert did not return a record");
    }

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
      payload: { method: "manual_transfer", status: "pending" },
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
      paymentMethod: "manual_transfer",
      paymentStatus: "pending",
      reference: createdOrder.reference,
      reservationExpiresAt,
      reused: false,
      status: "pending",
      totalInCop: quote.totalInCop,
    };
  });
}
