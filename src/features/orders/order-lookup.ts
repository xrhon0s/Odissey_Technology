import { z } from "zod";

export const orderLookupInputSchema = z.object({
  email: z.email("Escribe el correo usado en la compra.").max(254),
  reference: z
    .string()
    .trim()
    .min(8, "Escribe la referencia completa del pedido.")
    .max(40)
    .transform((value) => value.toUpperCase()),
});

export type OrderLookupInput = z.infer<typeof orderLookupInputSchema>;

export function getEffectiveOrderState(input: {
  paymentStatus: string;
  reservationExpiresAt: Date;
  status: string;
  now?: Date;
}) {
  const isExpired =
    input.status === "pending" &&
    input.reservationExpiresAt <= (input.now ?? new Date());

  return {
    paymentStatus:
      isExpired && input.paymentStatus === "pending"
        ? "voided"
        : input.paymentStatus,
    status: isExpired ? "cancelled" : input.status,
  };
}
