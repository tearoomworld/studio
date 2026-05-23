import { createBrowserClient } from "@supabase/ssr";
import { supabaseAuthOptions } from "./auth-options";
import { getSupabaseEnv } from "./env";

export function createClient() {
  const env = getSupabaseEnv();
  if (!env) {
    throw new Error("Supabase is not configured");
  }
  return createBrowserClient(env.url, env.key, supabaseAuthOptions);
}
