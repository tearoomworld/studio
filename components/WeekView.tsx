"use client";

import {
  addWeeks,
  eachDayOfInterval,
  endOfWeek,
  format,
  isSameDay,
  startOfWeek,
  subWeeks,
} from "date-fns";
import { useMemo, useState } from "react";

export type CalEvent = {
  id: string;
  title: string;
  starts_at: string;
  source_kind: string;
  description?: string | null;
  location?: string | null;
};

export function WeekView({
  events,
  initialWeek,
}: {
  events: CalEvent[];
  initialWeek?: Date;
}) {
  const [weekStart, setWeekStart] = useState(() =>
    startOfWeek(initialWeek ?? new Date(), { weekStartsOn: 1 }),
  );
  const [selected, setSelected] = useState<CalEvent | null>(null);

  const days = useMemo(() => {
    const end = endOfWeek(weekStart, { weekStartsOn: 1 });
    return eachDayOfInterval({ start: weekStart, end });
  }, [weekStart]);

  const weekLabel = `${format(weekStart, "MMM d")} — ${format(
    endOfWeek(weekStart, { weekStartsOn: 1 }),
    "MMM d, yyyy",
  )}`;

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="rounded-lg border border-black/10 px-3 py-1.5 text-sm"
            onClick={() => setWeekStart((d) => subWeeks(d, 1))}
          >
            ←
          </button>
          <button
            type="button"
            className="rounded-lg border border-black/10 px-3 py-1.5 text-sm font-medium"
            onClick={() =>
              setWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }))
            }
          >
            Today
          </button>
          <button
            type="button"
            className="rounded-lg border border-black/10 px-3 py-1.5 text-sm"
            onClick={() => setWeekStart((d) => addWeeks(d, 1))}
          >
            →
          </button>
        </div>
        <div className="text-sm font-medium text-ink">Week of {weekLabel}</div>
        <span className="text-xs text-ink/50">
          <span className="mr-1 inline-block h-2 w-2 rounded-full bg-sage" />
          Demos
        </span>
      </div>

      {events.length === 0 && (
        <p className="mb-4 text-sm text-ink/50">
          Calendar fills as you book demos.
        </p>
      )}

      <div className="grid grid-cols-7 gap-2">
        {days.map((day) => {
          const dayEvents = events.filter((e) =>
            isSameDay(new Date(e.starts_at), day),
          );
          return (
            <div
              key={day.toISOString()}
              className="min-h-[120px] rounded-xl border border-black/5 bg-soft-bg/50 p-2"
            >
              <div className="text-[10px] font-semibold uppercase text-ink/45">
                {format(day, "EEE")}
              </div>
              <div className="text-lg font-semibold text-ink">
                {format(day, "d")}
              </div>
              <div className="mt-2 space-y-1">
                {dayEvents.map((ev) => (
                  <button
                    key={ev.id}
                    type="button"
                    onClick={() => setSelected(ev)}
                    className="w-full rounded-md bg-sage/40 px-1.5 py-1 text-left text-[11px] leading-tight text-ink hover:bg-sage/60"
                  >
                    <span className="font-medium">
                      {format(new Date(ev.starts_at), "h:mm a").toLowerCase()}
                    </span>
                    <span className="block truncate">{ev.title}</span>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {selected && (
        <aside className="fixed right-0 top-0 z-20 h-full w-80 border-l border-black/10 bg-white p-6 shadow-lg">
          <button
            type="button"
            className="mb-4 text-sm text-ink/50"
            onClick={() => setSelected(null)}
          >
            Close
          </button>
          <p className="text-xs uppercase tracking-wide text-sage-deep">
            {selected.source_kind}
          </p>
          <h2 className="mt-1 text-xl font-semibold text-ink">
            {selected.title}
          </h2>
          <p className="mt-2 text-sm text-ink/70">
            {format(new Date(selected.starts_at), "EEEE, MMM d · h:mm a")}
          </p>
          {selected.description && (
            <p className="mt-4 text-sm leading-relaxed text-ink/80">
              {selected.description}
            </p>
          )}
          {selected.location && (
            <p className="mt-2 text-sm text-ink/60">{selected.location}</p>
          )}
        </aside>
      )}
    </div>
  );
}
