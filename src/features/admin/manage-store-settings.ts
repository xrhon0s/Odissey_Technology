import { and, eq } from "drizzle-orm";
import { z } from "zod";

import { getDb } from "@/db";
import { STORE_SETTINGS_ID } from "@/db/queries/store-settings";
import { adminUsers, storeSettings } from "@/db/schema";

const optionalEmail = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? null : value),
  z.email("Escribe un correo válido.").max(254).nullable(),
);

const optionalShortText = (maxLength: number) =>
  z.preprocess(
    (value) =>
      typeof value === "string" && value.trim() === "" ? null : value,
    z.string().trim().min(2).max(maxLength).nullable(),
  );

const optionalWhatsApp = z.preprocess(
  (value) => {
    if (typeof value !== "string") return value;
    const normalized = value.replace(/[^0-9]/g, "");
    return normalized === "" ? null : normalized;
  },
  z
    .string()
    .regex(
      /^\d{10,15}$/,
      "Usa entre 10 y 15 dígitos, incluido el código de país.",
    )
    .nullable(),
);

export const storeSettingsInputSchema = z
  .object({
    announcement: z.string().trim().min(3).max(180),
    businessCity: optionalShortText(120),
    legalName: optionalShortText(160),
    notificationAddress: optionalShortText(240),
    storeName: z.string().trim().min(2).max(120),
    supportEmail: optionalEmail,
    taxId: optionalShortText(30),
    whatsappEnabled: z.boolean(),
    whatsappNumber: optionalWhatsApp,
  })
  .superRefine((value, context) => {
    if (value.whatsappEnabled && !value.whatsappNumber) {
      context.addIssue({
        code: "custom",
        message: "Agrega el número antes de habilitar WhatsApp.",
        path: ["whatsappNumber"],
      });
    }
  });

export type StoreSettingsInput = z.infer<typeof storeSettingsInputSchema>;

export class StoreSettingsError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "StoreSettingsError";
  }
}

export async function updateStoreSettings(
  adminId: string,
  input: StoreSettingsInput,
) {
  return getDb().transaction(async (transaction) => {
    const [admin] = await transaction
      .select({ id: adminUsers.id })
      .from(adminUsers)
      .where(and(eq(adminUsers.id, adminId), eq(adminUsers.isActive, true)))
      .limit(1);

    if (!admin) {
      throw new StoreSettingsError("El administrador no está autorizado.");
    }

    const [settings] = await transaction
      .insert(storeSettings)
      .values({
        id: STORE_SETTINGS_ID,
        ...input,
        updatedByAdminId: adminId,
      })
      .onConflictDoUpdate({
        target: storeSettings.id,
        set: {
          ...input,
          updatedAt: new Date(),
          updatedByAdminId: adminId,
        },
      })
      .returning({ id: storeSettings.id });

    return settings;
  });
}
