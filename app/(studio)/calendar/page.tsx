import { StudioLayout } from "@/components/StudioLayout";
import { SurfaceHead } from "@/components/SurfaceHead";
import { CalendarView, type CalEvent } from "@/components/CalendarView";
import { createClient } from "@/lib/supabase/server";
import {
  CALENDAR_EVENT_SELECT_BASE,
  CALENDAR_EVENT_SELECT_FULL,
  getCalendarSchema,
} from "@/lib/calendar-schema";

export default async function CalendarPage() {
  const supabase = await createClient();
  const schema = await getCalendarSchema(supabase);
  const eventsQuery =
    schema === "full"
      ? supabase
          .from("calendar_events")
          .select(CALENDAR_EVENT_SELECT_FULL)
          .order("starts_at")
      : supabase
          .from("calendar_events")
          .select(CALENDAR_EVENT_SELECT_BASE)
          .order("starts_at");
  const { data: events } = await eventsQuery;

  const { data: companies } = await supabase
    .from("companies")
    .select("id, name, slug");

  return (
    <StudioLayout>
      <div className="mx-auto max-w-[1100px] px-12 py-12">
        <SurfaceHead
          eyebrow="Overview"
          title="Calendar."
          subtitle="Week and month views across all companies. Demos from Kindred Sales and Cal.com bookings sync here automatically. Pick a type and color for anything you add manually."
        />
        <CalendarView
          events={(events ?? []) as CalEvent[]}
          companies={companies ?? []}
        />
      </div>
    </StudioLayout>
  );
}
