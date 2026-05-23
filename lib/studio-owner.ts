/** Solo founder account for Studio sign-in. */
export function getStudioOwnerEmail() {
  return (
    process.env.STUDIO_OWNER_EMAIL?.trim() ||
    process.env.NEXT_PUBLIC_STUDIO_OWNER_EMAIL?.trim() ||
    "hq@tearoom.world"
  );
}
