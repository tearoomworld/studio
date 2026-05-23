import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const prospectId = new URL(request.url).searchParams.get("prospect_id");
  if (!prospectId) {
    return NextResponse.json({ error: "prospect_id required" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("sent_emails")
    .select("id, subject, body, sent_at, template_id, templates(name)")
    .eq("prospect_id", prospectId)
    .order("sent_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}
