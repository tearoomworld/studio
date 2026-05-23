import { createHmac, timingSafeEqual } from "crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase/admin";
import { defaultColorForKind } from "@/lib/calendar-colors";
import { getCalendarSchema } from "@/lib/calendar-schema";

type CalAttendee = { email?: string; name?: string };
type CalPayload = {
  uid?: string;
  title?: string;
  startTime?: string;
  endTime?: string;
  location?: string;
  additionalNotes?: string;
  attendees?: CalAttendee[];
  metadata?: Record<string, unknown>;
  videoCallData?: { url?: string };
};

export type CalWebhookBody = {
  triggerEvent?: string;
  payload?: CalPayload;
};

export function verifyCalSignature(
  rawBody: string,
  signature: string | null,
  secret: string | undefined,
) {
  if (!secret) return true;
  if (!signature) return false;
  const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
  try {
    return timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expected),
    );
  } catch {
    return false;
  }
}

function guestEmail(payload: CalPayload) {
  const guest = payload.attendees?.find(
    (a) => a.email && !a.email.includes("tearoom.world"),
  );
  return guest?.email ?? payload.attendees?.[0]?.email ?? null;
}

function guestName(payload: CalPayload) {
  const guest = payload.attendees?.[0];
  return guest?.name ?? guest?.email ?? "Guest";
}

function locationLabel(payload: CalPayload) {
  if (payload.videoCallData?.url) return payload.videoCallData.url;
  if (typeof payload.location === "string") return payload.location;
  return null;
}

function calMarker(uid: string) {
  return `[cal.com:${uid}]`;
}

function calDescription(uid: string, notes?: string | null) {
  const marker = calMarker(uid);
  if (!notes?.trim()) return marker;
  if (notes.includes(marker)) return notes;
  return `${marker}\n\n${notes.trim()}`;
}

async function resolveCompanyAndProspect(
  supabase: SupabaseClient,
  payload: CalPayload,
  email: string | null,
) {
  let prospectId: string | null = null;
  let companyId: string | null = null;

  if (email) {
    const { data: prospect } = await supabase
      .from("prospects")
      .select("id, team_id, name, teams(company_id)")
      .ilike("contact_email", email)
      .maybeSingle();

    if (prospect) {
      prospectId = prospect.id;
      const teams = prospect.teams as
        | { company_id: string }
        | { company_id: string }[]
        | null;
      companyId = Array.isArray(teams)
        ? (teams[0]?.company_id ?? null)
        : (teams?.company_id ?? null);

      await supabase
        .from("prospects")
        .update({
          status: "demo_booked",
          demo_at: payload.startTime,
          last_touch_at: new Date().toISOString(),
        })
        .eq("id", prospect.id);
    }
  }

  if (!companyId) {
    const { data: kindred } = await supabase
      .from("companies")
      .select("id")
      .eq("slug", "kindred")
      .maybeSingle();
    companyId = kindred?.id ?? null;
  }

  return { prospectId, companyId };
}

async function upsertCalEventLegacy(
  supabase: SupabaseClient,
  payload: CalPayload,
  kind: "demo" | "cancelled",
) {
  const uid = payload.uid;
  if (!uid) return;

  if (kind === "cancelled") {
    await supabase
      .from("calendar_events")
      .delete()
      .eq("source_kind", "demo")
      .ilike("description", `%${calMarker(uid)}%`);
    return;
  }

  if (!payload.startTime) return;

  const email = guestEmail(payload);
  const name = guestName(payload);
  const { companyId } = await resolveCompanyAndProspect(supabase, payload, email);

  const row = {
    source_kind: "demo",
    company_id: companyId,
    title: payload.title ?? `Demo · ${name}`,
    description: calDescription(uid, payload.additionalNotes),
    starts_at: payload.startTime,
    ends_at: payload.endTime ?? null,
    location: locationLabel(payload),
  };

  const { data: existing } = await supabase
    .from("calendar_events")
    .select("id")
    .eq("source_kind", "demo")
    .ilike("description", `%${calMarker(uid)}%`)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from("calendar_events")
      .update(row)
      .eq("id", existing.id);
    if (error) throw error;
  } else {
    const { error } = await supabase.from("calendar_events").insert(row);
    if (error) throw error;
  }
}

async function upsertCalEventFull(
  supabase: SupabaseClient,
  payload: CalPayload,
  kind: "demo" | "cancelled",
) {
  const uid = payload.uid;
  if (!uid || !payload.startTime) return;

  if (kind === "cancelled") {
    await supabase
      .from("calendar_events")
      .delete()
      .eq("external_source", "cal.com")
      .eq("external_id", uid);
    return;
  }

  const email = guestEmail(payload);
  const name = guestName(payload);
  const { prospectId, companyId } = await resolveCompanyAndProspect(
    supabase,
    payload,
    email,
  );

  const row = {
    source_kind: "demo",
    external_source: "cal.com",
    external_id: uid,
    company_id: companyId,
    title: payload.title ?? `Demo · ${name}`,
    description: payload.additionalNotes ?? null,
    starts_at: payload.startTime,
    ends_at: payload.endTime ?? null,
    location: locationLabel(payload),
    attendee_email: email,
    prospect_id: prospectId,
    color: defaultColorForKind("demo"),
  };

  const { data: existing } = await supabase
    .from("calendar_events")
    .select("id")
    .eq("external_source", "cal.com")
    .eq("external_id", uid)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from("calendar_events")
      .update(row)
      .eq("id", existing.id);
    if (error) throw error;
  } else {
    const { error } = await supabase.from("calendar_events").insert(row);
    if (error) throw error;
  }
}

async function upsertCalEvent(
  payload: CalPayload,
  kind: "demo" | "cancelled",
) {
  const uid = payload.uid;
  if (!uid) return;
  if (kind !== "cancelled" && !payload.startTime) return;

  const supabase = createAdminClient();
  const schema = await getCalendarSchema(supabase);

  if (schema === "legacy") {
    await upsertCalEventLegacy(supabase, payload, kind);
  } else {
    await upsertCalEventFull(supabase, payload, kind);
  }
}

export async function handleCalWebhook(body: CalWebhookBody) {
  const event = body.triggerEvent;
  const payload = body.payload;
  if (!event || !payload) return { ok: true, skipped: true };

  switch (event) {
    case "BOOKING_CREATED":
    case "BOOKING_CONFIRMED":
    case "BOOKING_RESCHEDULED":
      await upsertCalEvent(payload, "demo");
      break;
    case "BOOKING_CANCELLED":
    case "BOOKING_REJECTED":
      await upsertCalEvent(payload, "cancelled");
      break;
    default:
      break;
  }

  return { ok: true };
}

export function isCalSyncedEvent(event: {
  external_source?: string | null;
  description?: string | null;
}) {
  return (
    event.external_source === "cal.com" ||
    !!event.description?.includes("[cal.com:")
  );
}
