import { z } from "zod";

import { checkoutQuoteRequestSchema } from "@/features/checkout/checkout-schema";

export const createOrderRequestSchema = z.object({
  checkout: checkoutQuoteRequestSchema,
  checkoutAttemptId: z.uuid(),
});

export type CreateOrderRequest = z.infer<typeof createOrderRequestSchema>;
