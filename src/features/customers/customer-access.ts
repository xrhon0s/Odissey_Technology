import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { cache } from "react";
import { z } from "zod";

import { getDb } from "@/db";
import { customerProfiles } from "@/db/schema";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const customerClaimsSchema = z.object({
  email: z.email().max(254),
  sub: z.uuid(),
  user_metadata: z
    .object({
      full_name: z.string().trim().min(2).max(120).optional(),
      phone: z.string().trim().min(7).max(20).optional(),
    })
    .optional(),
});

export type CustomerIdentity = {
  email: string;
  fullName: string;
  id: string;
  phone: string | null;
};

function fallbackName(email: string) {
  const prefix = email
    .split("@")[0]
    ?.replace(/[._-]+/g, " ")
    .trim();
  return prefix && prefix.length >= 2 ? prefix.slice(0, 120) : "Cliente";
}

export const getCustomerIdentity = cache(
  async (): Promise<CustomerIdentity | null> => {
    const supabase = await createSupabaseServerClient();
    if (!supabase) return null;

    const { data, error } = await supabase.auth.getClaims();
    const claims = customerClaimsSchema.safeParse(data?.claims);

    if (error || !claims.success) return null;

    return {
      email: claims.data.email.toLowerCase(),
      fullName:
        claims.data.user_metadata?.full_name ?? fallbackName(claims.data.email),
      id: claims.data.sub,
      phone: claims.data.user_metadata?.phone ?? null,
    };
  },
);

export async function ensureCustomerProfile(identity: CustomerIdentity) {
  const database = getDb();
  const [existingProfile] = await database
    .select({
      email: customerProfiles.email,
      fullName: customerProfiles.fullName,
      id: customerProfiles.id,
      phone: customerProfiles.phone,
    })
    .from(customerProfiles)
    .where(eq(customerProfiles.id, identity.id))
    .limit(1);

  if (existingProfile) return existingProfile;

  const [createdProfile] = await database
    .insert(customerProfiles)
    .values({
      email: identity.email,
      fullName: identity.fullName,
      id: identity.id,
      phone: identity.phone,
    })
    .onConflictDoNothing()
    .returning({
      email: customerProfiles.email,
      fullName: customerProfiles.fullName,
      id: customerProfiles.id,
      phone: customerProfiles.phone,
    });

  if (createdProfile) return createdProfile;

  const [profile] = await database
    .select({
      email: customerProfiles.email,
      fullName: customerProfiles.fullName,
      id: customerProfiles.id,
      phone: customerProfiles.phone,
    })
    .from(customerProfiles)
    .where(eq(customerProfiles.id, identity.id))
    .limit(1);

  if (!profile) {
    throw new Error("No fue posible preparar el perfil del cliente.");
  }

  return profile;
}

export async function requireCustomer() {
  const identity = await getCustomerIdentity();
  if (!identity) redirect("/cuenta/acceder");

  return ensureCustomerProfile(identity);
}
