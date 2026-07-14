import { and, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { z } from "zod";

import { getDb } from "@/db";
import { adminUsers } from "@/db/schema";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type AuthenticatedAdmin = {
  email: string;
  fullName: string;
  id: string;
  role: "owner" | "admin";
};

export type AdminAccess =
  | { status: "authenticated"; admin: AuthenticatedAdmin }
  | { status: "unauthenticated" | "unauthorized" | "unconfigured" };

export async function getAdminAccess(): Promise<AdminAccess> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { status: "unconfigured" };

  const { data, error } = await supabase.auth.getClaims();
  const subject = z.uuid().safeParse(data?.claims?.sub);

  if (error || !subject.success) return { status: "unauthenticated" };

  const [admin] = await getDb()
    .select({
      email: adminUsers.email,
      fullName: adminUsers.fullName,
      id: adminUsers.id,
      role: adminUsers.role,
    })
    .from(adminUsers)
    .where(and(eq(adminUsers.id, subject.data), eq(adminUsers.isActive, true)))
    .limit(1);

  return admin
    ? { admin, status: "authenticated" }
    : { status: "unauthorized" };
}

export async function requireAdmin() {
  const access = await getAdminAccess();

  if (access.status === "unconfigured") {
    redirect("/login?reason=configuration");
  }

  if (access.status === "unauthorized") {
    redirect("/login?reason=authorization");
  }

  if (access.status !== "authenticated") {
    redirect("/login");
  }

  return access.admin;
}
