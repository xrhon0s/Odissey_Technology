"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/features/admin/admin-access";
import {
  storeSettingsInputSchema,
  StoreSettingsError,
  updateStoreSettings,
} from "@/features/admin/manage-store-settings";

export type StoreSettingsActionState = {
  error?: string;
  success?: string;
};

export async function updateStoreSettingsAction(
  _state: StoreSettingsActionState,
  formData: FormData,
): Promise<StoreSettingsActionState> {
  const admin = await requireAdmin();
  const input = storeSettingsInputSchema.safeParse({
    announcement: formData.get("announcement"),
    storeName: formData.get("storeName"),
    supportEmail: formData.get("supportEmail"),
    whatsappEnabled: formData.get("whatsappEnabled") === "on",
    whatsappNumber: formData.get("whatsappNumber"),
  });

  if (!input.success) {
    return {
      error:
        input.error.issues[0]?.message ??
        "Revisa la configuración de la tienda.",
    };
  }

  try {
    await updateStoreSettings(admin.id, input.data);
    revalidatePath("/", "layout");
    revalidatePath("/admin/configuracion");
    return { success: "Configuración actualizada correctamente." };
  } catch (error) {
    return {
      error:
        error instanceof StoreSettingsError
          ? error.message
          : "No fue posible actualizar la configuración.",
    };
  }
}
