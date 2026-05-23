"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function CalendarAddEvent({
  companies,
}: {
  companies: { id: string; name: string; slug: string }[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [companyId, setCompanyId] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/calendar-events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        starts_at: new Date(startsAt).toISOString(),
        company_id: companyId || null,
      }),
    });
    setOpen(false);
    setTitle("");
    setStartsAt("");
    router.refresh();
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mb-6 rounded-lg bg-ink px-4 py-2 text-sm font-medium text-white"
      >
        Add event
      </button>
    );
  }

  return (
    <form
      onSubmit={submit}
      className="mb-6 flex flex-wrap items-end gap-3 rounded-xl border border-black/5 bg-soft-bg p-4"
    >
      <label className="flex flex-col gap-1 text-xs text-ink/50">
        Title
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="rounded border border-black/10 px-2 py-1.5 text-sm"
        />
      </label>
      <label className="flex flex-col gap-1 text-xs text-ink/50">
        Starts
        <input
          type="datetime-local"
          value={startsAt}
          onChange={(e) => setStartsAt(e.target.value)}
          required
          className="rounded border border-black/10 px-2 py-1.5 text-sm"
        />
      </label>
      <label className="flex flex-col gap-1 text-xs text-ink/50">
        Company
        <select
          value={companyId}
          onChange={(e) => setCompanyId(e.target.value)}
          className="rounded border border-black/10 px-2 py-1.5 text-sm"
        >
          <option value="">Studio-wide</option>
          {companies.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </label>
      <button type="submit" className="rounded-lg bg-ink px-4 py-2 text-sm text-white">
        Save
      </button>
      <button
        type="button"
        onClick={() => setOpen(false)}
        className="text-sm text-ink/50"
      >
        Cancel
      </button>
    </form>
  );
}
