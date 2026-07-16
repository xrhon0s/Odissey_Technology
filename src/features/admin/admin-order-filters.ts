import { z } from "zod";

export const adminOrderFiltersSchema = z.object({
  orderStatus: z
    .enum([
      "pending",
      "confirmed",
      "preparing",
      "shipped",
      "delivered",
      "cancelled",
    ])
    .optional()
    .catch(undefined),
  paymentStatus: z
    .enum(["pending", "approved", "declined", "voided", "refunded"])
    .optional()
    .catch(undefined),
  query: z.string().trim().max(120).optional().catch(undefined),
});

export type AdminOrderFilters = z.infer<typeof adminOrderFiltersSchema>;
