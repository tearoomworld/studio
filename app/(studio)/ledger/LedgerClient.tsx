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

const MARK: Record<string, string> = {
  yes: "✓",
  maybe: "?",
  no: "×",
};

export function LedgerClient({ initial }: { initial: Entry[] }) {
  const router = useRouter();
  const [entries, setEntries] = useState(initial);
  const [editing, setEditing] = useState<Entry | null>(null);
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
      <div className="grid gap-4 md:grid-cols-2">
        {entries.map((e) => (
          <div
            key={e.id}
            className="rounded-2xl border border-black/5 p-5"
          >
            <strong className="flex items-start gap-2 text-ink">
              <span
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded text-xs ${
                  e.status === "yes"
                    ? "bg-sage"
                    : e.status === "maybe"
                      ? "bg-black/5"
                      : "bg-blush/40"
                }`}
              >
                {MARK[e.status] ?? "·"}
              </span>
              {e.title}
            </strong>
            {e.body && (
              <p className="mt-3 text-sm leading-relaxed text-ink/70">{e.body}</p>
            )}
            <div className="mt-4 flex gap-3 text-xs">
              <button
                type="button"
                onClick={() => {
                  setEditing(e);
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
              <button type="button" onClick={() => remove(e.id)}>
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={save} className="mt-10 max-w-lg space-y-3 rounded-2xl border border-black/5 p-6">
        <h3 className="font-semibold">{editing ? "Edit entry" : "Add entry"}</h3>
        <select
          value={form.status}
          onChange={(e) => setForm({ ...form, status: e.target.value })}
          className="w-full rounded border border-black/10 px-3 py-2 text-sm"
        >
          <option value="yes">Yes — working</option>
          <option value="maybe">Maybe</option>
          <option value="no">No — not working</option>
        </select>
        <input
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          placeholder="Title"
          required
          className="w-full rounded border border-black/10 px-3 py-2 text-sm"
        />
        <textarea
          value={form.body}
          onChange={(e) => setForm({ ...form, body: e.target.value })}
          placeholder="Body"
          rows={4}
          className="w-full rounded border border-black/10 px-3 py-2 text-sm"
        />
        <button type="submit" className="rounded-lg bg-ink px-4 py-2 text-sm text-white">
          {editing ? "Update" : "Add"}
        </button>
        {editing && (
          <button
            type="button"
            className="ml-2 text-sm text-ink/50"
            onClick={() => {
              setEditing(null);
              setForm({ status: "yes", title: "", body: "", company_slug: "" });
            }}
          >
            Cancel
          </button>
        )}
      </form>
    </>
  );
}
