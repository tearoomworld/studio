import { createClient } from "@supabase/supabase-js";
import { supabaseAuthOptions } from "./auth-options";

export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !key) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY",
    );
  }
  return createClient(url, key, {
    ...supabaseAuthOptions,
    auth: {
      ...supabaseAuthOptions.auth,
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
