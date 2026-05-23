import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendKindredEmail } from "@/lib/resend";

export async function POST(request: Request) {
  const { prospect_id, subject, body, template_id } = await request.json();
  const supabase = await createClient();

  const { data: prospect, error: pe } = await supabase
    .from("prospects")
    .select("*, teams(company_id, companies(voice_skill))")
    .eq("id", prospect_id)
    .single();

  if (pe || !prospect?.contact_email) {
    return NextResponse.json(
      { error: pe?.message ?? "Prospect email required" },
      { status: 400 },
    );
  }

  const result = await sendKindredEmail({
    to: prospect.contact_email,
    subject,
    body,
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  await supabase.from("sent_emails").insert({
    prospect_id,
    template_id: template_id ?? null,
    subject,
    body,
    resend_id: result.id,
  });

  const keepStatus = ["replied", "demo_booked", "won"].includes(prospect.status);
  await supabase
    .from("prospects")
    .update({
      status: keepStatus ? prospect.status : "contacted",
      last_touch_at: new Date().toISOString(),
    })
    .eq("id", prospect_id);

  return NextResponse.json({ ok: true, resend_id: result.id });
}
