import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const teamId = new URL(request.url).searchParams.get("team_id");
  const status = new URL(request.url).searchParams.get("status");
  if (!teamId) {
    return NextResponse.json({ error: "team_id required" }, { status: 400 });
  }
  const supabase = await createClient();
  let q = supabase.from("content_ideas").select("*").eq("team_id", teamId);
  if (status) q = q.eq("status", status);
  const { data, error } = await q.order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const body = await request.json();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("content_ideas")
    .insert(body)
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}
