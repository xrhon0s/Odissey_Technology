"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getDb } from "@/db";
import { customerProfiles } from "@/db/schema";
import { requireCustomer } from "@/features/customers/customer-access";
import { customerProfileSchema } from "@/features/customers/customer-auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type CustomerProfileState = {
  error?: string;
  success?: string;
};

export async function updateCustomerProfileAction(
  _previousState: CustomerProfileState,
  formData: FormData,
): Promise<CustomerProfileState> {
  const profile = await requireCustomer();
  const input = customerProfileSchema.safeParse({
    fullName: formData.get("fullName"),
    phone: formData.get("phone"),
  });

  if (!input.success) {
    return {
      error: input.error.issues[0]?.message ?? "Revisa los datos del perfil.",
    };
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) return { error: "La autenticación no está disponible." };

  const { error } = await supabase.auth.updateUser({
    data: {
      full_name: input.data.fullName,
      phone: input.data.phone,
    },
  });

  if (error) {
    return { error: "No pudimos actualizar el perfil. Inténtalo nuevamente." };
  }

  await getDb()
    .update(customerProfiles)
    .set({ ...input.data, updatedAt: new Date() })
    .where(eq(customerProfiles.id, profile.id));

  revalidatePath("/cuenta");
  return { success: "Datos actualizados." };
}

export async function customerLogoutAction() {
  const supabase = await createSupabaseServerClient();
  if (supabase) await supabase.auth.signOut();

  redirect("/");
}
