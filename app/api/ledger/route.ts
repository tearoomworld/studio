import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("ledger_entries")
    .select("*")
    .order("order_index");
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const body = await request.json();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("ledger_entries")
    .insert({
      status: body.status,
      title: body.title,
      body: body.body ?? null,
      company_slug: body.company_slug ?? null,
      order_index: body.order_index ?? 0,
    })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}
