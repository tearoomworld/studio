import type { SupabaseClient } from "@supabase/supabase-js";

let schema: "full" | "legacy" | undefined;

export async function getCalendarSchema(supabase: SupabaseClient) {
  if (schema) return schema;
  const { error } = await supabase
    .from("calendar_events")
    .select("color")
    .limit(1);
  schema =
    error?.message?.includes("color") ||
    error?.message?.includes("schema cache")
      ? "legacy"
      : "full";
  return schema;
}

export const CALENDAR_EVENT_SELECT_BASE =
  "id, title, starts_at, ends_at, source_kind, description, location, company_id, companies(name, slug)";

export const CALENDAR_EVENT_SELECT_FULL = `${CALENDAR_EVENT_SELECT_BASE}, color, attendee_email, external_source, external_id`;

export function calendarEventSelect(mode: "full" | "legacy") {
  return mode === "full"
    ? CALENDAR_EVENT_SELECT_FULL
    : CALENDAR_EVENT_SELECT_BASE;
}

export function calendarEventWritePayload(
  mode: "full" | "legacy",
  body: Record<string, unknown>,
) {
  const base: Record<string, unknown> = {
    source_kind: body.source_kind ?? "manual",
    title: body.title,
    description: body.description ?? null,
    starts_at: body.starts_at,
    ends_at: body.ends_at ?? null,
    company_id: body.company_id || null,
    location: body.location ?? null,
  };
  if (mode === "legacy") return base;
  return {
    ...base,
    color: body.color ?? null,
    attendee_email: body.attendee_email ?? null,
  };
}

export function calendarEventPatchPayload(
  mode: "full" | "legacy",
  body: Record<string, unknown>,
) {
  const updates: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };
  if (body.title !== undefined) updates.title = body.title;
  if (body.description !== undefined) updates.description = body.description;
  if (body.starts_at !== undefined) updates.starts_at = body.starts_at;
  if (body.ends_at !== undefined) updates.ends_at = body.ends_at;
  if (body.source_kind !== undefined) updates.source_kind = body.source_kind;
  if (body.company_id !== undefined) updates.company_id = body.company_id || null;
  if (body.location !== undefined) updates.location = body.location;
  if (mode === "full") {
    if (body.color !== undefined) updates.color = body.color;
    if (body.attendee_email !== undefined) {
      updates.attendee_email = body.attendee_email;
    }
  }
  return updates;
}
