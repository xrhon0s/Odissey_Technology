"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import {
  customerPasswordResetRequestSchema,
  customerPasswordUpdateSchema,
} from "@/features/customers/customer-auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type PasswordActionState = {
  error?: string;
  success?: string;
};

function getRecoveryUrl() {
  const appUrl = z.url().safeParse(process.env.NEXT_PUBLIC_APP_URL);
  return appUrl.success
    ? new URL(
        "/cuenta/confirmar?next=/cuenta/nueva-contrasena",
        appUrl.data,
      ).toString()
    : undefined;
}

export async function requestPasswordResetAction(
  _previousState: PasswordActionState,
  formData: FormData,
): Promise<PasswordActionState> {
  const input = customerPasswordResetRequestSchema.safeParse({
    email: formData.get("email"),
  });
  if (!input.success) return { error: "Escribe un correo válido." };

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return { error: "La recuperación de cuenta no está configurada." };
  }

  const redirectTo = getRecoveryUrl();
  await supabase.auth.resetPasswordForEmail(input.data.email, {
    ...(redirectTo ? { redirectTo } : {}),
  });

  return {
    success:
      "Si existe una cuenta con ese correo, recibirás un enlace para cambiar la contraseña.",
  };
}

export async function updateCustomerPasswordAction(
  _previousState: PasswordActionState,
  formData: FormData,
): Promise<PasswordActionState> {
  const input = customerPasswordUpdateSchema.safeParse({
    password: formData.get("password"),
    passwordConfirmation: formData.get("passwordConfirmation"),
  });
  if (!input.success) {
    return {
      error: input.error.issues[0]?.message ?? "Revisa la nueva contraseña.",
    };
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return { error: "La recuperación de cuenta no está configurada." };
  }

  const { data } = await supabase.auth.getClaims();
  if (!data?.claims?.sub) {
    return {
      error: "El enlace venció o no es válido. Solicita uno nuevo.",
    };
  }

  const { error } = await supabase.auth.updateUser({
    password: input.data.password,
  });
  if (error) {
    return {
      error: "No pudimos cambiar la contraseña. Solicita un enlace nuevo.",
    };
  }

  redirect("/cuenta");
}
