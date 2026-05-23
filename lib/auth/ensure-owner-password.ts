import { getStudioOwnerEmail } from "@/lib/studio-owner";
import { createAdminClient } from "@/lib/supabase/admin";

/** Create or update the solo owner account with a password (no email verification). */
export async function ensureOwnerPassword(password: string) {
  const admin = createAdminClient();
  const email = getStudioOwnerEmail().toLowerCase();

  const { data, error } = await admin.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });
  if (error) throw error;

  const existing = data.users.find((u) => u.email?.toLowerCase() === email);

  if (existing) {
    const { error: updateError } = await admin.auth.admin.updateUserById(
      existing.id,
      { password, email_confirm: true },
    );
    if (updateError) throw updateError;
    return existing.id;
  }

  const { data: created, error: createError } =
    await admin.auth.admin.createUser({
      email: getStudioOwnerEmail(),
      password,
      email_confirm: true,
    });
  if (createError) throw createError;
  return created.user.id;
}
