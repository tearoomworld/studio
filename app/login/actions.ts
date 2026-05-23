"use server";

import { redirect } from "next/navigation";
import { ensureOwnerPassword } from "@/lib/auth/ensure-owner-password";
import { getStudioOwnerEmail } from "@/lib/studio-owner";
import { createClient } from "@/lib/supabase/server";

export type SignInState = { error?: string };

export async function signIn(
  _prev: SignInState,
  formData: FormData,
): Promise<SignInState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  const ownerEmail = getStudioOwnerEmail().toLowerCase();
  if (email !== ownerEmail) {
    return { error: "Invalid email or password." };
  }

  const supabase = await createClient();

  async function attempt() {
    return supabase.auth.signInWithPassword({ email, password });
  }

  let { error } = await attempt();

  if (error?.message.toLowerCase().includes("invalid login credentials")) {
    try {
      await ensureOwnerPassword(password);
      ({ error } = await attempt());
    } catch (e) {
      const message = e instanceof Error ? e.message : "Could not set up account.";
      return { error: message };
    }
  }

  if (error) {
    return { error: error.message };
  }

  redirect("/");
}
