"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Entry = {
  id: string;
  status: string;
  title: string;
  body: string | null;
  company_slug: string | null;
};

function LedgerMark({ status }: { status: string }) {
  const mark = status === "yes" ? "✓" : status === "maybe" ? "?" : "×";
  return (
    <span
      className={`mr-2.5 inline-flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
        status === "yes"
          ? "bg-sage text-ink"
          : status === "maybe"
            ? "bg-soft-bg text-ink"
            : "border-[1.5px] border-ink bg-white text-ink"
      }`}
    >
      {mark}
    </span>
  );
}

export function LedgerClient({ initial }: { initial: Entry[] }) {
  const router = useRouter();
  const [entries, setEntries] = useState(initial);
  const [editing, setEditing] = useState<Entry | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    status: "yes",
    title: "",
    body: "",
    company_slug: "",
  });

  async function refresh() {
    const data = await fetch("/api/ledger").then((r) => r.json());
    setEntries(data);
    router.refresh();
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (editing) {
      await fetch(`/api/ledger/${editing.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: form.status,
          title: form.title,
          body: form.body || null,
          company_slug: form.company_slug || null,
        }),
      });
    } else {
      await fetch("/api/ledger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: form.status,
          title: form.title,
          body: form.body || null,
          company_slug: form.company_slug || null,
        }),
      });
    }
    setEditing(null);
    setShowForm(false);
    setForm({ status: "yes", title: "", body: "", company_slug: "" });
    refresh();
  }

  async function remove(id: string) {
    if (!confirm("Delete entry?")) return;
    await fetch(`/api/ledger/${id}`, { method: "DELETE" });
    refresh();
  }

  return (
    <>
      <div className="grid gap-3 md:grid-cols-2">
        {entries.map((e) => (
          <article
            key={e.id}
            className="group rounded-2xl border border-black/[0.06] bg-white px-5 py-[18px]"
          >
            <strong className="flex items-start text-[13.5px] font-semibold leading-snug tracking-tight text-ink">
              <LedgerMark status={e.status} />
              {e.title}
            </strong>
            {e.body && (
              <p className="mt-1.5 pl-[28px] text-[12.5px] leading-relaxed text-ink/55">
                {e.body}
              </p>
            )}
            <div className="mt-3 pl-[28px] flex gap-3 text-[11px] opacity-0 transition group-hover:opacity-100">
              <button
                type="button"
                className="text-ink/50 hover:text-ink"
                onClick={() => {
                  setEditing(e);
                  setShowForm(true);
                  setForm({
                    status: e.status,
                    title: e.title,
                    body: e.body ?? "",
                    company_slug: e.company_slug ?? "",
                  });
                }}
              >
                Edit
              </button>
              <button
                type="button"
                className="text-ink/50 hover:text-ink"
                onClick={() => remove(e.id)}
              >
                Delete
              </button>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-8">
        {!showForm ? (
          <button
            type="button"
            onClick={() => {
              setEditing(null);
              setForm({ status: "yes", title: "", body: "", company_slug: "" });
              setShowForm(true);
            }}
            className="rounded-lg border border-black/10 bg-white px-4 py-2 text-sm font-medium text-ink hover:bg-soft-bg"
          >
            + Add learning
          </button>
        ) : (
          <form
            onSubmit={save}
            className="max-w-xl space-y-3 rounded-2xl border border-black/[0.06] bg-soft-bg/40 p-6"
          >
            <h3 className="font-semibold text-ink">
              {editing ? "Edit entry" : "Add to ledger"}
            </h3>
            <select
              value={form.status}
              onChange={(ev) => setForm({ ...form, status: ev.target.value })}
              className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm"
            >
              <option value="yes">✓ Yes — working</option>
              <option value="maybe">? Maybe — untested</option>
              <option value="no">× No — not working</option>
            </select>
            <input
              value={form.title}
              onChange={(ev) => setForm({ ...form, title: ev.target.value })}
              placeholder="What's the pattern?"
              required
              className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm"
            />
            <textarea
              value={form.body}
              onChange={(ev) => setForm({ ...form, body: ev.target.value })}
              placeholder="Evidence, context, when to apply it…"
              rows={4}
              className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm"
            />
            <div className="flex gap-2">
              <button
                type="submit"
                className="rounded-lg bg-ink px-4 py-2 text-sm text-white"
              >
                {editing ? "Update" : "Add"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditing(null);
                }}
                className="text-sm text-ink/50"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </>
  );
}
