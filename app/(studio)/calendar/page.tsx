import { StudioLayout } from "@/components/StudioLayout";
import { WeekView } from "@/components/WeekView";
import { CalendarAddEvent } from "./CalendarAddEvent";
import { createClient } from "@/lib/supabase/server";

export default async function CalendarPage() {
  const supabase = await createClient();
  const { data: events } = await supabase
    .from("calendar_events")
    .select("id, title, starts_at, source_kind, description, location")
    .order("starts_at");

  const { data: companies } = await supabase
    .from("companies")
    .select("id, name, slug");

  return (
    <StudioLayout>
      <div className="mx-auto max-w-[1100px] px-12 py-12">
        <header className="mb-8 border-b border-black/5 pb-6">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-ink/45">
            Overview
          </p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight text-ink">
            Calendar.
          </h1>
          <p className="mt-3 text-base text-ink/70">
            Everything date-bound across companies. Demos from Kindred Sales
            auto-flow here.
          </p>
        </header>
        <CalendarAddEvent companies={companies ?? []} />
        <WeekView events={events ?? []} />
      </div>
    </StudioLayout>
  );
}
