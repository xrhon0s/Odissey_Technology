"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import {
  customerLoginSchema,
  customerRegistrationSchema,
  customerReturnPathSchema,
} from "@/features/customers/customer-auth";
import {
  ensureCustomerProfile,
  type CustomerIdentity,
} from "@/features/customers/customer-access";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type CustomerAuthState = {
  error?: string;
  success?: string;
};

function getConfirmationUrl(nextPath: string) {
  const appUrl = z.url().safeParse(process.env.NEXT_PUBLIC_APP_URL);
  return appUrl.success
    ? new URL(
        `/cuenta/confirmar?next=${encodeURIComponent(nextPath)}`,
        appUrl.data,
      ).toString()
    : undefined;
}

export async function customerLoginAction(
  _previousState: CustomerAuthState,
  formData: FormData,
): Promise<CustomerAuthState> {
  const credentials = customerLoginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  const nextPath = customerReturnPathSchema.parse(formData.get("next"));

  if (!credentials.success) {
    return { error: "Revisa el correo y la contraseña." };
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return { error: "El acceso de clientes todavía no está configurado." };
  }

  const { data, error } = await supabase.auth.signInWithPassword(
    credentials.data,
  );

  if (error || !data.user?.email) {
    return { error: "Correo o contraseña incorrectos." };
  }

  await ensureCustomerProfile({
    email: data.user.email.toLowerCase(),
    fullName:
      customerRegistrationSchema.shape.fullName.safeParse(
        data.user.user_metadata.full_name,
      ).data ?? "Cliente",
    id: data.user.id,
    phone:
      customerRegistrationSchema.shape.phone.safeParse(
        data.user.user_metadata.phone,
      ).data ?? null,
  });

  redirect(nextPath);
}

export async function customerRegistrationAction(
  _previousState: CustomerAuthState,
  formData: FormData,
): Promise<CustomerAuthState> {
  const registration = customerRegistrationSchema.safeParse({
    email: formData.get("email"),
    fullName: formData.get("fullName"),
    password: formData.get("password"),
    passwordConfirmation: formData.get("passwordConfirmation"),
    phone: formData.get("phone"),
  });
  const nextPath = customerReturnPathSchema.parse(formData.get("next"));

  if (!registration.success) {
    return {
      error:
        registration.error.issues[0]?.message ??
        "Revisa los datos del registro.",
    };
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return { error: "El acceso de clientes todavía no está configurado." };
  }

  const { email, fullName, password, phone } = registration.data;
  const emailRedirectTo = getConfirmationUrl(nextPath);
  const { data, error } = await supabase.auth.signUp({
    email,
    options: {
      ...(emailRedirectTo ? { emailRedirectTo } : {}),
      data: { full_name: fullName, phone },
    },
    password,
  });

  if (error || !data.user) {
    return {
      error:
        "No pudimos crear la cuenta. Inténtalo de nuevo o inicia sesión si ya la tienes.",
    };
  }

  if (!data.session) {
    return {
      success:
        "Revisa tu correo y confirma la cuenta. Después podrás iniciar sesión.",
    };
  }

  const identity: CustomerIdentity = {
    email: email.toLowerCase(),
    fullName,
    id: data.user.id,
    phone,
  };
  await ensureCustomerProfile(identity);
  redirect(nextPath);
}
