"use client";

import {
  EVENT_COLOR_SWATCHES,
  EVENT_KINDS,
  defaultColorForKind,
  eventTint,
  resolveEventColor,
} from "@/lib/calendar-colors";
import {
  addMonths,
  addWeeks,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isWeekend,
  startOfMonth,
  startOfWeek,
  subMonths,
  subWeeks,
} from "date-fns";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

export type CalEvent = {
  id: string;
  title: string;
  starts_at: string;
  ends_at?: string | null;
  source_kind: string;
  description?: string | null;
  location?: string | null;
  company_id?: string | null;
  color?: string | null;
  attendee_email?: string | null;
  external_source?: string | null;
  external_id?: string | null;
  companies?: { name: string; slug: string } | { name: string; slug: string }[] | null;
};

type ViewMode = "week" | "month";

type EventForm = {
  title: string;
  starts_at: string;
  ends_at: string;
  source_kind: string;
  company_id: string;
  description: string;
  location: string;
  color: string;
  attendee_email: string;
};

const emptyForm = (): EventForm => ({
  title: "",
  starts_at: "",
  ends_at: "",
  source_kind: "manual",
  company_id: "",
  description: "",
  location: "",
  color: defaultColorForKind("manual"),
  attendee_email: "",
});

function companyLabel(ev: CalEvent) {
  const c = ev.companies;
  const name = Array.isArray(c) ? c[0]?.name : c?.name;
  if (name) return name;
  if (ev.source_kind === "demo") return "Kindred";
  return "Studio";
}

function kindLabel(kind: string) {
  return EVENT_KINDS.find((k) => k.value === kind)?.label ?? kind;
}

function EventChip({
  ev,
  compact,
  onSelect,
}: {
  ev: CalEvent;
  compact?: boolean;
  onSelect: (ev: CalEvent) => void;
}) {
  const hex = resolveEventColor(ev);
  return (
    <button
      type="button"
      onClick={() => onSelect(ev)}
      className={`w-full rounded-md border-l-2 px-2 text-left transition hover:translate-x-0.5 ${
        compact ? "py-0.5" : "py-1.5"
      }`}
      style={{
        borderLeftColor: hex,
        backgroundColor: eventTint(hex),
      }}
    >
      <div
        className={`font-semibold uppercase tracking-wide text-ink/45 ${
          compact ? "text-[9px]" : "text-[10px]"
        }`}
      >
        {format(new Date(ev.starts_at), "h:mm a")}
      </div>
      <div
        className={`font-semibold leading-tight text-ink ${
          compact ? "truncate text-[10px]" : "text-xs"
        }`}
      >
        {ev.title}
      </div>
      {!compact && (
        <div className="text-[10.5px] text-ink/45">
          {companyLabel(ev)} · {kindLabel(ev.source_kind)}
        </div>
      )}
    </button>
  );
}

function AddEventForm({
  form,
  setForm,
  companies,
  saving,
  onSubmit,
  onCancel,
}: {
  form: EventForm;
  setForm: (f: EventForm) => void;
  companies: { id: string; name: string; slug: string }[];
  saving: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}) {
  return (
    <form
      onSubmit={onSubmit}
      className="mb-5 grid gap-3 rounded-2xl border border-black/[0.06] bg-soft-bg/60 p-5 md:grid-cols-2"
    >
      <label className="text-xs text-ink/50 md:col-span-2">
        Title
        <input
          required
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          className="mt-1 w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm"
          placeholder="Brookdale Atlanta demo"
        />
      </label>
      <label className="text-xs text-ink/50">
        Starts
        <input
          required
          type="datetime-local"
          value={form.starts_at}
          onChange={(e) => setForm({ ...form, starts_at: e.target.value })}
          className="mt-1 w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm"
        />
      </label>
      <label className="text-xs text-ink/50">
        Ends <span className="text-ink/35">(optional)</span>
        <input
          type="datetime-local"
          value={form.ends_at}
          onChange={(e) => setForm({ ...form, ends_at: e.target.value })}
          className="mt-1 w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm"
        />
      </label>
      <label className="text-xs text-ink/50">
        Type
        <select
          value={form.source_kind}
          onChange={(e) => {
            const kind = e.target.value;
            setForm({
              ...form,
              source_kind: kind,
              color: defaultColorForKind(kind),
            });
          }}
          className="mt-1 w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm"
        >
          {EVENT_KINDS.map((k) => (
            <option key={k.value} value={k.value}>
              {k.label}
            </option>
          ))}
        </select>
      </label>
      <label className="text-xs text-ink/50">
        Company
        <select
          value={form.company_id}
          onChange={(e) => setForm({ ...form, company_id: e.target.value })}
          className="mt-1 w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm"
        >
          <option value="">Studio-wide</option>
          {companies.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </label>
      <div className="text-xs text-ink/50 md:col-span-2">
        Color
        <div className="mt-2 flex flex-wrap items-center gap-2">
          {EVENT_COLOR_SWATCHES.map((hex) => (
            <button
              key={hex}
              type="button"
              aria-label={`Color ${hex}`}
              onClick={() => setForm({ ...form, color: hex })}
              className={`h-7 w-7 rounded-full border-2 transition ${
                form.color === hex
                  ? "border-ink scale-110"
                  : "border-transparent hover:scale-105"
              }`}
              style={{ backgroundColor: hex }}
            />
          ))}
          <label className="flex items-center gap-2 rounded-lg border border-black/10 bg-white px-2 py-1">
            <span className="text-[10px] uppercase tracking-wide text-ink/40">
              Custom
            </span>
            <input
              type="color"
              value={form.color}
              onChange={(e) => setForm({ ...form, color: e.target.value })}
              className="h-6 w-8 cursor-pointer border-0 bg-transparent p-0"
            />
          </label>
        </div>
      </div>
      <label className="text-xs text-ink/50">
        Guest email <span className="text-ink/35">(optional)</span>
        <input
          type="email"
          value={form.attendee_email}
          onChange={(e) =>
            setForm({ ...form, attendee_email: e.target.value })
          }
          className="mt-1 w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm"
          placeholder="ad@community.org"
        />
      </label>
      <label className="text-xs text-ink/50">
        Location
        <input
          value={form.location}
          onChange={(e) => setForm({ ...form, location: e.target.value })}
          className="mt-1 w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm"
          placeholder="Zoom / Atlanta"
        />
      </label>
      <label className="text-xs text-ink/50 md:col-span-2">
        Notes
        <textarea
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          rows={2}
          className="mt-1 w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm"
        />
      </label>
      <div className="flex items-end gap-2 md:col-span-2">
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-ink px-4 py-2 text-sm text-white disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save event"}
        </button>
        <button type="button" onClick={onCancel} className="text-sm text-ink/50">
          Cancel
        </button>
      </div>
    </form>
  );
}

export function CalendarView({
  events,
  companies,
}: {
  events: CalEvent[];
  companies: { id: string; name: string; slug: string }[];
}) {
  const router = useRouter();
  const [view, setView] = useState<ViewMode>("week");
  const [focusDate, setFocusDate] = useState(() => new Date());
  const [selected, setSelected] = useState<CalEvent | null>(null);
  const [editing, setEditing] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<EventForm>(emptyForm);

  const weekStart = startOfWeek(focusDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(focusDate, { weekStartsOn: 1 });
  const monthStart = startOfMonth(focusDate);
  const monthEnd = endOfMonth(focusDate);

  const gridDays = useMemo(() => {
    if (view === "week") {
      return eachDayOfInterval({ start: weekStart, end: weekEnd });
    }
    const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
    return eachDayOfInterval({ start: gridStart, end: gridEnd });
  }, [view, weekStart, weekEnd, monthStart, monthEnd]);

  const rangeStart = view === "week" ? weekStart : monthStart;
  const rangeEnd = view === "week" ? weekEnd : monthEnd;

  const rangeEvents = events.filter((e) => {
    const d = new Date(e.starts_at);
    return d >= rangeStart && d <= rangeEnd;
  });

  const stats = {
    demos: rangeEvents.filter((e) => e.source_kind === "demo").length,
    content: rangeEvents.filter((e) => e.source_kind === "content").length,
    field: rangeEvents.filter((e) => e.source_kind === "field").length,
    total: rangeEvents.length,
  };

  const headerLabel =
    view === "week"
      ? `Week of ${format(weekStart, "MMM d")} — ${format(weekEnd, "MMM d, yyyy")}`
      : format(focusDate, "MMMM yyyy");

  function navigate(dir: -1 | 0 | 1) {
    if (dir === 0) {
      setFocusDate(new Date());
      return;
    }
    if (view === "week") {
      setFocusDate((d) => (dir < 0 ? subWeeks(d, 1) : addWeeks(d, 1)));
    } else {
      setFocusDate((d) => (dir < 0 ? subMonths(d, 1) : addMonths(d, 1)));
    }
  }

  function openAddForDay(day: Date) {
    const local = format(day, "yyyy-MM-dd'T'09:00");
    setForm({ ...emptyForm(), starts_at: local });
    setShowAdd(true);
  }

  function toForm(ev: CalEvent): EventForm {
    return {
      title: ev.title,
      starts_at: format(new Date(ev.starts_at), "yyyy-MM-dd'T'HH:mm"),
      ends_at: ev.ends_at
        ? format(new Date(ev.ends_at), "yyyy-MM-dd'T'HH:mm")
        : "",
      source_kind: ev.source_kind,
      company_id: ev.company_id ?? "",
      description: ev.description ?? "",
      location: ev.location ?? "",
      color: ev.color ?? defaultColorForKind(ev.source_kind),
      attendee_email: ev.attendee_email ?? "",
    };
  }

  async function saveEvent(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const payload = {
      title: form.title,
      starts_at: new Date(form.starts_at).toISOString(),
      ends_at: form.ends_at ? new Date(form.ends_at).toISOString() : null,
      source_kind: form.source_kind,
      company_id: form.company_id || null,
      description: form.description || null,
      location: form.location || null,
      color: form.color,
      attendee_email: form.attendee_email || null,
    };

    if (editing && selected) {
      await fetch(`/api/calendar-events/${selected.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } else {
      await fetch("/api/calendar-events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    }

    setSaving(false);
    setShowAdd(false);
    setEditing(false);
    setSelected(null);
    setForm(emptyForm());
    router.refresh();
  }

  async function deleteEvent(id: string) {
    if (!confirm("Delete this event?")) return;
    await fetch(`/api/calendar-events/${id}`, { method: "DELETE" });
    setSelected(null);
    setEditing(false);
    router.refresh();
  }

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex gap-1">
            <button
              type="button"
              className="rounded-lg border border-black/10 bg-white px-3 py-1.5 text-[13px] text-ink/80 hover:bg-soft-bg"
              onClick={() => navigate(-1)}
            >
              ←
            </button>
            <button
              type="button"
              className="rounded-lg border border-black/10 bg-white px-3 py-1.5 text-[13px] font-medium text-ink hover:bg-soft-bg"
              onClick={() => navigate(0)}
            >
              Today
            </button>
            <button
              type="button"
              className="rounded-lg border border-black/10 bg-white px-3 py-1.5 text-[13px] text-ink/80 hover:bg-soft-bg"
              onClick={() => navigate(1)}
            >
              →
            </button>
          </div>
          <div className="flex rounded-lg border border-black/10 bg-white p-0.5">
            {(["week", "month"] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setView(mode)}
                className={`rounded-md px-3 py-1 text-xs font-medium capitalize ${
                  view === mode
                    ? "bg-ink text-white"
                    : "text-ink/60 hover:text-ink"
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>
        <div className="text-sm font-semibold tracking-tight text-ink">
          {headerLabel}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setEditing(false);
              setForm(emptyForm());
              setShowAdd((v) => !v);
            }}
            className="rounded-lg bg-ink px-3 py-1.5 text-xs font-medium text-white"
          >
            + Add event
          </button>
        </div>
      </div>

      {(showAdd || editing) && (
        <AddEventForm
          form={form}
          setForm={setForm}
          companies={companies}
          saving={saving}
          onSubmit={saveEvent}
          onCancel={() => {
            setShowAdd(false);
            setEditing(false);
            if (!selected) setForm(emptyForm());
          }}
        />
      )}

      <div
        className={`mb-5 grid gap-2 ${
          view === "month" ? "grid-cols-7" : "grid-cols-7"
        }`}
      >
        {view === "month" &&
          ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
            <div
              key={d}
              className="pb-1 text-center text-[10px] font-semibold uppercase tracking-wide text-ink/40"
            >
              {d}
            </div>
          ))}

        {gridDays.map((day) => {
          const dayEvents = events.filter((ev) =>
            isSameDay(new Date(ev.starts_at), day),
          );
          const today = isSameDay(day, new Date());
          const weekend = isWeekend(day);
          const inMonth = view === "week" || isSameMonth(day, focusDate);
          const maxVisible = view === "month" ? 3 : 99;

          return (
            <div
              key={day.toISOString()}
              role="button"
              tabIndex={0}
              onClick={() => {
                if (dayEvents.length === 0) openAddForDay(day);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && dayEvents.length === 0) openAddForDay(day);
              }}
              className={`flex flex-col rounded-[10px] border p-2.5 transition ${
                view === "month" ? "min-h-[100px]" : "min-h-[180px]"
              } ${
                today
                  ? "border-ink border-[1.5px] bg-white"
                  : weekend
                    ? "border-black/[0.06] bg-[#fafbfb]"
                    : "border-black/[0.06] bg-white"
              } ${!inMonth && view === "month" ? "opacity-40" : ""}`}
            >
              <div className="flex items-start justify-between gap-1">
                <div>
                  {view === "week" && (
                    <div
                      className={`text-[10px] font-semibold uppercase tracking-wide ${
                        today ? "text-ink" : "text-ink/45"
                      }`}
                    >
                      {today
                        ? `${format(day, "EEE")} · today`
                        : format(day, "EEE")}
                    </div>
                  )}
                  <div
                    className={`font-bold tracking-tight text-ink ${
                      view === "month" ? "text-base" : "text-xl"
                    }`}
                  >
                    {format(day, "d")}
                  </div>
                </div>
                {view === "month" && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      openAddForDay(day);
                    }}
                    className="text-[10px] text-ink/35 hover:text-ink"
                  >
                    +
                  </button>
                )}
              </div>
              <div className="mt-1.5 flex flex-1 flex-col gap-1">
                {dayEvents.slice(0, maxVisible).map((ev) => (
                  <EventChip
                    key={ev.id}
                    ev={ev}
                    compact={view === "month"}
                    onSelect={setSelected}
                  />
                ))}
                {dayEvents.length > maxVisible && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setView("week");
                      setFocusDate(day);
                    }}
                    className="text-left text-[10px] font-medium text-ink/50 hover:text-ink"
                  >
                    +{dayEvents.length - maxVisible} more
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="studio-card grid grid-cols-2 gap-3 p-5 md:grid-cols-4">
        <div>
          <div className="text-[26px] font-bold tabular-nums text-ink">
            {stats.demos}
          </div>
          <div className="text-[11px] uppercase tracking-wide text-ink/45">
            demos {view === "week" ? "this week" : "this month"}
          </div>
        </div>
        <div>
          <div className="text-[26px] font-bold tabular-nums text-ink">
            {stats.content}
          </div>
          <div className="text-[11px] uppercase tracking-wide text-ink/45">
            content drops
          </div>
        </div>
        <div>
          <div className="text-[26px] font-bold tabular-nums text-ink">
            {stats.field}
          </div>
          <div className="text-[11px] uppercase tracking-wide text-ink/45">
            field / events
          </div>
        </div>
        <div>
          <div className="text-[26px] font-bold tabular-nums text-ink">
            {stats.total}
          </div>
          <div className="text-[11px] uppercase tracking-wide text-ink/45">
            total bookings
          </div>
        </div>
      </div>

      {selected && !editing && (
        <aside className="fixed right-0 top-0 z-30 flex h-full w-80 flex-col border-l border-black/10 bg-white p-6 shadow-xl">
          <button
            type="button"
            className="mb-4 self-start text-sm text-ink/50"
            onClick={() => setSelected(null)}
          >
            Close
          </button>
          <div
            className="mb-3 h-1 w-12 rounded-full"
            style={{ backgroundColor: resolveEventColor(selected) }}
          />
          <p className="text-xs font-semibold uppercase tracking-wide text-sage-deep">
            {kindLabel(selected.source_kind)}
            {(selected.external_source === "cal.com" ||
              selected.description?.includes("[cal.com:")) &&
              " · Cal.com"}
          </p>
          <h2 className="mt-1 text-xl font-semibold text-ink">
            {selected.title}
          </h2>
          <p className="mt-2 text-sm text-ink/70">
            {format(new Date(selected.starts_at), "EEEE, MMM d · h:mm a")}
            {selected.ends_at &&
              ` – ${format(new Date(selected.ends_at), "h:mm a")}`}
          </p>
          <p className="mt-1 text-sm text-ink/50">{companyLabel(selected)}</p>
          {selected.attendee_email && (
            <p className="mt-2 text-sm text-ink/70">{selected.attendee_email}</p>
          )}
          {selected.description && (
            <p className="mt-4 text-sm leading-relaxed text-ink/80">
              {selected.description}
            </p>
          )}
          {selected.location && (
            <p className="mt-2 break-all text-sm text-ink/60">
              {selected.location}
            </p>
          )}
          <div className="mt-auto flex gap-2 pt-6">
            <button
              type="button"
              onClick={() => {
                setEditing(true);
                setForm(toForm(selected));
                setShowAdd(false);
              }}
              className="rounded-lg bg-ink px-3 py-2 text-sm text-white"
            >
              Edit
            </button>
            {!selected.external_source && (
              <button
                type="button"
                onClick={() => deleteEvent(selected.id)}
                className="rounded-lg border border-black/10 px-3 py-2 text-sm text-ink/60"
              >
                Delete
              </button>
            )}
          </div>
        </aside>
      )}
    </div>
  );
}
