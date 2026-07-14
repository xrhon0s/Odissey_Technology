import { afterEach, describe, expect, it } from "vitest";

import { getSupabasePublicConfig } from "./supabase";

const originalUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const originalKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

afterEach(() => {
  process.env.NEXT_PUBLIC_SUPABASE_URL = originalUrl;
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = originalKey;
});

describe("getSupabasePublicConfig", () => {
  it("returns null when auth is not configured", () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

    expect(getSupabasePublicConfig()).toBeNull();
  });

  it("accepts a valid project URL and publishable key", () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://project.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY =
      "sb_publishable_test_key_123456789";

    expect(getSupabasePublicConfig()).toEqual({
      publishableKey: "sb_publishable_test_key_123456789",
      url: "https://project.supabase.co",
    });
  });

  it("does not enable auth with documented placeholder values", () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = "sb_publishable_example";

    expect(getSupabasePublicConfig()).toBeNull();
  });
});
