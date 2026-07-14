import { z } from "zod";

const checkoutLineSchema = z.object({
  quantity: z.number().int().min(1).max(10),
  variantId: z.uuid(),
});

export const checkoutAddressSchema = z.object({
  addressLine1: z.string().trim().min(5).max(180),
  addressLine2: z.string().trim().max(180).optional(),
  city: z.string().trim().min(2).max(100),
  deliveryNotes: z.string().trim().max(500).optional(),
  department: z.string().trim().min(2).max(100),
  neighborhood: z.string().trim().max(100).optional(),
});

export const checkoutCustomerSchema = z.object({
  email: z.email().max(254),
  fullName: z.string().trim().min(2).max(120),
  phone: z
    .string()
    .trim()
    .regex(/^(?:\+?57)?3\d{9}$/, "Ingresa un celular colombiano válido"),
});

export const checkoutFormSchema = z.object({
  address: checkoutAddressSchema.optional(),
  customer: checkoutCustomerSchema,
  shippingMethodCode: z.string().trim().min(1, "Selecciona una opción"),
});

export const checkoutQuoteRequestSchema = z
  .object({
    address: checkoutAddressSchema.optional(),
    customer: checkoutCustomerSchema,
    items: z.array(checkoutLineSchema).min(1).max(50),
    shippingMethodCode: z
      .string()
      .trim()
      .min(1)
      .max(60)
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  })
  .superRefine(({ items }, context) => {
    const variantIds = new Set<string>();

    items.forEach((item, index) => {
      if (variantIds.has(item.variantId)) {
        context.addIssue({
          code: "custom",
          message: "Cada variante debe aparecer una sola vez",
          path: ["items", index, "variantId"],
        });
      }

      variantIds.add(item.variantId);
    });
  });

export type CheckoutQuoteRequest = z.infer<typeof checkoutQuoteRequestSchema>;
export type CheckoutFormValues = z.infer<typeof checkoutFormSchema>;
