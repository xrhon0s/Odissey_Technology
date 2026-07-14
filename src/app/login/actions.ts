"use server";

import { and, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { z } from "zod";

import { getDb } from "@/db";
import { adminUsers } from "@/db/schema";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const loginSchema = z.object({
  email: z.email().max(254),
  password: z.string().min(8).max(200),
});

export type LoginState = { error?: string };

export async function loginAction(
  _previousState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const credentials = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!credentials.success) {
    return { error: "Revisa el correo y la contraseña." };
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return { error: "Supabase Auth todavía no está configurado." };
  }

  const { data, error } = await supabase.auth.signInWithPassword(
    credentials.data,
  );

  if (error || !data.user) {
    return { error: "Credenciales inválidas o acceso no autorizado." };
  }

  const [admin] = await getDb()
    .select({ id: adminUsers.id })
    .from(adminUsers)
    .where(and(eq(adminUsers.id, data.user.id), eq(adminUsers.isActive, true)))
    .limit(1);

  if (!admin) {
    await supabase.auth.signOut();
    return { error: "Credenciales inválidas o acceso no autorizado." };
  }

  redirect("/admin");
}

export async function logoutAction() {
  const supabase = await createSupabaseServerClient();
  if (supabase) await supabase.auth.signOut();

  redirect("/login");
}
