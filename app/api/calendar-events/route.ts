import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("calendar_events")
    .select("*")
    .order("starts_at");
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const body = await request.json();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("calendar_events")
    .insert({
      source_kind: "manual",
      title: body.title,
      description: body.description ?? null,
      starts_at: body.starts_at,
      ends_at: body.ends_at ?? null,
      company_id: body.company_id ?? null,
      location: body.location ?? null,
    })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}
