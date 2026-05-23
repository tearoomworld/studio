import { ensureOwnerPassword } from "../lib/auth/ensure-owner-password";
import { getStudioOwnerEmail } from "../lib/studio-owner";

async function main() {
  const password = process.env.STUDIO_OWNER_PASSWORD?.trim();
  if (!password) {
    console.error("Set STUDIO_OWNER_PASSWORD in .env.local");
    process.exit(1);
  }
  await ensureOwnerPassword(password);
  console.log(`Owner ready: ${getStudioOwnerEmail()}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
