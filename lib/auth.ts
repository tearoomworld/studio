import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSupabaseEnv } from "@/lib/supabase/env";

export async function requireUser() {
  if (!getSupabaseEnv()) {
    redirect(
      `/login?message=${encodeURIComponent("Vercel is missing Supabase environment variables. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY, then redeploy.")}`,
    );
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) {
      console.error("[requireUser]", error.message);
      redirect("/login");
    }

    if (!user) redirect("/login");
    return user;
  } catch (e) {
    console.error("[requireUser]", e);
    redirect("/login");
  }
}
