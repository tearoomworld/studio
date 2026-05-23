import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { supabaseAuthOptions } from "./auth-options";
import { requireSupabaseEnv } from "./env";

export async function createClient() {
  const { url, key } = requireSupabaseEnv();
  const cookieStore = await cookies();

  return createServerClient(url, key, {
    ...supabaseAuthOptions,
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // setAll from Server Component
        }
      },
    },
  });
}
