/** Shared auth flags — keep browser + server clients in sync. */
export const supabaseAuthOptions = {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
};
