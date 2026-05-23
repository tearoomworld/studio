import { NextResponse } from "next/server";
import {
  CALENDAR_EVENT_SELECT_BASE,
  CALENDAR_EVENT_SELECT_FULL,
  calendarEventWritePayload,
  getCalendarSchema,
} from "@/lib/calendar-schema";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const schema = await getCalendarSchema(supabase);
  const query =
    schema === "full"
      ? supabase
          .from("calendar_events")
          .select(CALENDAR_EVENT_SELECT_FULL)
          .order("starts_at")
      : supabase
          .from("calendar_events")
          .select(CALENDAR_EVENT_SELECT_BASE)
          .order("starts_at");
  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const body = await request.json();
  const supabase = await createClient();
  const schema = await getCalendarSchema(supabase);
  const { data, error } = await supabase
    .from("calendar_events")
    .insert(calendarEventWritePayload(schema, body))
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}
