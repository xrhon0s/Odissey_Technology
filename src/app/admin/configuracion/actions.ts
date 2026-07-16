"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireAdmin } from "@/features/admin/admin-access";
import {
  createShippingMethod,
  shippingMethodInputSchema,
  ShippingMethodManagementError,
  updateShippingMethod,
} from "@/features/admin/manage-shipping-methods";
import {
  storeSettingsInputSchema,
  StoreSettingsError,
  updateStoreSettings,
} from "@/features/admin/manage-store-settings";

export type StoreSettingsActionState = {
  error?: string;
  success?: string;
};

export type ShippingMethodActionState = {
  error?: string;
  success?: string;
};

function shippingMethodValues(formData: FormData) {
  return {
    code: formData.get("code"),
    description: formData.get("description"),
    isActive: formData.get("isActive") === "on",
    name: formData.get("name"),
    priceInCop: formData.get("priceInCop"),
    requiresAddress: formData.get("requiresAddress") === "on",
    sortOrder: formData.get("sortOrder"),
  };
}

function shippingMethodError(error: unknown) {
  return error instanceof ShippingMethodManagementError
    ? error.message
    : "No fue posible guardar el método de envío.";
}

export async function createShippingMethodAction(
  _state: ShippingMethodActionState,
  formData: FormData,
): Promise<ShippingMethodActionState> {
  const admin = await requireAdmin();
  const input = shippingMethodInputSchema.safeParse(
    shippingMethodValues(formData),
  );

  if (!input.success) {
    return {
      error: input.error.issues[0]?.message ?? "Revisa el método de envío.",
    };
  }

  try {
    await createShippingMethod(admin.id, input.data);
    revalidatePath("/admin/configuracion");
    revalidatePath("/checkout");
    return { success: "Método de envío creado correctamente." };
  } catch (error) {
    return { error: shippingMethodError(error) };
  }
}

export async function updateShippingMethodAction(
  _state: ShippingMethodActionState,
  formData: FormData,
): Promise<ShippingMethodActionState> {
  const admin = await requireAdmin();
  const shippingMethodId = formData.get("shippingMethodId");
  const input = shippingMethodInputSchema.safeParse(
    shippingMethodValues(formData),
  );

  if (
    typeof shippingMethodId !== "string" ||
    !z.uuid().safeParse(shippingMethodId).success ||
    !input.success
  ) {
    return {
      error: input.success
        ? "El método de envío no es válido."
        : (input.error.issues[0]?.message ?? "Revisa el método de envío."),
    };
  }

  try {
    await updateShippingMethod(admin.id, shippingMethodId, input.data);
    revalidatePath("/admin/configuracion");
    revalidatePath("/checkout");
    return { success: "Método de envío actualizado correctamente." };
  } catch (error) {
    return { error: shippingMethodError(error) };
  }
}

export async function updateStoreSettingsAction(
  _state: StoreSettingsActionState,
  formData: FormData,
): Promise<StoreSettingsActionState> {
  const admin = await requireAdmin();
  const input = storeSettingsInputSchema.safeParse({
    announcement: formData.get("announcement"),
    bancolombiaAccountNumber: formData.get("bancolombiaAccountNumber"),
    bancolombiaEnabled: formData.get("bancolombiaEnabled") === "on",
    bancolombiaKey: formData.get("bancolombiaKey"),
    businessCity: formData.get("businessCity"),
    cashOnDeliveryEnabled: formData.get("cashOnDeliveryEnabled") === "on",
    daviplataEnabled: false,
    legalName: formData.get("legalName"),
    notificationAddress: formData.get("notificationAddress"),
    nequiEnabled: formData.get("nequiEnabled") === "on",
    nequiKey: formData.get("nequiKey"),
    nequiNumber: formData.get("nequiNumber"),
    storeName: formData.get("storeName"),
    supportEmail: formData.get("supportEmail"),
    taxId: formData.get("taxId"),
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
