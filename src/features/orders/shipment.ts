import { z } from "zod";

const optionalTrackingUrl = z.preprocess(
  (value) =>
    typeof value === "string" && value.trim() === ""
      ? null
      : typeof value === "string"
        ? value.trim()
        : value,
  z
    .url("Escribe un enlace de rastreo válido.")
    .max(500)
    .refine(
      (value) => /^https?:\/\//i.test(value),
      "El enlace debe comenzar por http:// o https://.",
    )
    .nullable(),
);

const optionalDeliveryDate = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? null : value),
  z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Selecciona una fecha válida.")
    .transform((value) => new Date(`${value}T12:00:00-05:00`))
    .nullable(),
);

export const shipmentInputSchema = z.object({
  carrier: z.string().trim().min(2).max(120),
  estimatedDeliveryAt: optionalDeliveryDate,
  trackingNumber: z.string().trim().min(3).max(120),
  trackingUrl: optionalTrackingUrl,
});

export type ShipmentInput = z.infer<typeof shipmentInputSchema>;
