import { Resend } from "resend";

const FROM = "hello@kindred.care";

export async function sendKindredEmail(input: {
  to: string;
  subject: string;
  body: string;
}) {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    return {
      ok: false as const,
      error:
        "RESEND_API_KEY is not set. Add your key after verifying kindred.care in Resend.",
    };
  }

  const resend = new Resend(key);
  const { data, error } = await resend.emails.send({
    from: FROM,
    to: input.to,
    subject: input.subject,
    text: input.body,
  });

  if (error) {
    return { ok: false as const, error: error.message };
  }

  return { ok: true as const, id: data?.id ?? null };
}
