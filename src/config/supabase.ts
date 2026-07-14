import { z } from "zod";

const supabasePublicConfigSchema = z.object({
  publishableKey: z
    .string()
    .startsWith("sb_publishable_")
    .refine((value) => value !== "sb_publishable_example"),
  url: z
    .url()
    .startsWith("https://")
    .refine((value) => value !== "https://example.supabase.co"),
});

export type SupabasePublicConfig = z.infer<typeof supabasePublicConfigSchema>;

export function getSupabasePublicConfig(): SupabasePublicConfig | null {
  const result = supabasePublicConfigSchema.safeParse({
    publishableKey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
  });

  return result.success ? result.data : null;
}
