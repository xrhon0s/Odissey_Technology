import { describe, expect, it } from "vitest";

import {
  InvalidPaymentActionError,
  planAdminPaymentAction,
} from "./payment-actions";

const pendingTransfer = {
  action: "approve_transfer" as const,
  isReservationExpired: false,
  orderStatus: "pending" as const,
  paymentMethod: "nequi" as const,
  paymentStatus: "pending" as const,
};

describe("planAdminPaymentAction", () => {
  it("approves a transfer and commits reserved inventory", () => {
    expect(planAdminPaymentAction(pendingTransfer)).toEqual({
      eventType: "approved_by_admin",
      inventoryEffect: "commit_reservation",
      nextOrderStatus: "confirmed",
      nextPaymentStatus: "approved",
    });
  });

  it("confirms cash delivery without marking cash as received", () => {
    expect(
      planAdminPaymentAction({
        ...pendingTransfer,
        action: "confirm_cash_on_delivery",
        paymentMethod: "cash_on_delivery",
      }),
    ).toEqual({
      eventType: "cash_order_confirmed",
      inventoryEffect: "commit_reservation",
      nextOrderStatus: "confirmed",
    });
  });

  it("records cash only after the delivery order is confirmed", () => {
    expect(
      planAdminPaymentAction({
        ...pendingTransfer,
        action: "record_cash_received",
        orderStatus: "shipped",
        paymentMethod: "cash_on_delivery",
      }),
    ).toMatchObject({
      inventoryEffect: "none",
      nextPaymentStatus: "approved",
    });
  });

  it("releases inventory when an order is declined", () => {
    expect(
      planAdminPaymentAction({
        ...pendingTransfer,
        action: "decline_order",
      }),
    ).toMatchObject({
      inventoryEffect: "release_reservation",
      nextOrderStatus: "cancelled",
      nextPaymentStatus: "declined",
    });
  });

  it("rejects approval after reservation expiry", () => {
    expect(() =>
      planAdminPaymentAction({
        ...pendingTransfer,
        isReservationExpired: true,
      }),
    ).toThrow(InvalidPaymentActionError);
  });

  it("prevents double processing", () => {
    expect(() =>
      planAdminPaymentAction({
        ...pendingTransfer,
        paymentStatus: "approved",
      }),
    ).toThrow(InvalidPaymentActionError);
  });
});
