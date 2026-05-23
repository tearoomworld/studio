"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSiteOrigin } from "@/lib/site-url";

export async function loginAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const supabase = await createClient();
  const origin = getSiteOrigin();

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
    },
  });

  if (error) {
    redirect(
      `/login?message=${encodeURIComponent(error.message)}`,
    );
  }

  redirect(
    `/login?message=${encodeURIComponent("Check your email for the sign-in link.")}`,
  );
}
