"use client";

import { useCallback, useEffect, useState } from "react";

type Prospect = {
  id: string;
  name: string;
  contact_name: string | null;
  contact_email: string | null;
  status: string;
  notes: string | null;
  demo_at: string | null;
};

type Template = {
  id: string;
  name: string;
  subject: string;
  body: string;
};

const STATUSES = [
  "researching",
  "contacted",
  "replied",
  "demo_booked",
  "won",
  "lost",
];

export function SalesTabs({
  teamId,
  voiceSkill,
}: {
  teamId: string;
  voiceSkill: string;
}) {
  const [tab, setTab] = useState("pipeline");
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const load = useCallback(async () => {
    const [p, t] = await Promise.all([
      fetch(`/api/prospects?team_id=${teamId}`).then((r) => r.json()),
      fetch(`/api/templates?team_id=${teamId}`).then((r) => r.json()),
    ]);
    setProspects(p);
    setTemplates(t);
  }, [teamId]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="mt-8">
      <div className="flex gap-2 border-b border-black/5 pb-2">
        {(["pipeline", "compose", "demos", "templates"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium capitalize ${
              tab === t ? "bg-ink text-white" : "text-ink/60 hover:bg-black/5"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "pipeline" && (
        <PipelineTab
          teamId={teamId}
          prospects={prospects}
          onChange={load}
        />
      )}
      {tab === "compose" && (
        <ComposeTab
          prospects={prospects}
          templates={templates}
          voiceSkill={voiceSkill}
          onSent={load}
        />
      )}
      {tab === "demos" && (
        <DemosTab prospects={prospects.filter((p) => p.status === "demo_booked")} />
      )}
      {tab === "templates" && (
        <TemplatesTab teamId={teamId} templates={templates} onChange={load} />
      )}
    </div>
  );
}

function PipelineTab({
  teamId,
  prospects,
  onChange,
}: {
  teamId: string;
  prospects: Prospect[];
  onChange: () => void;
}) {
  const [name, setName] = useState("");
  const [bulk, setBulk] = useState("");

  async function addOne(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/prospects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ team_id: teamId, name }),
    });
    setName("");
    onChange();
  }

  async function bulkPaste() {
    const lines = bulk.split("\n").filter(Boolean);
    for (const line of lines) {
      const n = line.split(",")[0]?.trim() || line.trim();
      if (!n) continue;
      await fetch("/api/prospects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ team_id: teamId, name: n, notes: line }),
      });
    }
    setBulk("");
    onChange();
  }

  async function update(id: string, patch: Partial<Prospect>) {
    await fetch(`/api/prospects/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    onChange();
  }

  return (
    <div className="mt-6 space-y-6">
      <form onSubmit={addOne} className="flex gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Community name"
          className="flex-1 rounded-lg border border-black/10 px-3 py-2 text-sm"
        />
        <button type="submit" className="rounded-lg bg-ink px-4 py-2 text-sm text-white">
          Add prospect
        </button>
      </form>
      <div>
        <textarea
          value={bulk}
          onChange={(e) => setBulk(e.target.value)}
          placeholder="Bulk paste — one per line"
          className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm"
          rows={3}
        />
        <button
          type="button"
          onClick={bulkPaste}
          className="mt-2 text-sm font-medium text-ink"
        >
          Import lines
        </button>
      </div>
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-black/5 text-xs text-ink/45">
            <th className="py-2">Name</th>
            <th>Status</th>
            <th>Demo</th>
          </tr>
        </thead>
        <tbody>
          {prospects.map((p) => (
            <tr key={p.id} className="border-b border-black/5">
              <td className="py-3 font-medium">{p.name}</td>
              <td>
                <select
                  value={p.status}
                  onChange={(e) => update(p.id, { status: e.target.value })}
                  className="rounded border border-black/10 px-2 py-1 text-xs"
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </td>
              <td>
                {p.status === "demo_booked" && (
                  <input
                    type="datetime-local"
                    defaultValue={
                      p.demo_at
                        ? new Date(p.demo_at).toISOString().slice(0, 16)
                        : ""
                    }
                    onBlur={(e) =>
                      update(p.id, {
                        demo_at: e.target.value
                          ? new Date(e.target.value).toISOString()
                          : null,
                      })
                    }
                    className="rounded border border-black/10 px-2 py-1 text-xs"
                  />
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ComposeTab({
  prospects,
  templates,
  voiceSkill,
  onSent,
}: {
  prospects: Prospect[];
  templates: Template[];
  voiceSkill: string;
  onSent: () => void;
}) {
  const [prospectId, setProspectId] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  const prospect = prospects.find((p) => p.id === prospectId);

  function applyTemplate(id: string) {
    const t = templates.find((x) => x.id === id);
    if (!t || !prospect) return;
    const sub = t.subject
      .replace(/\{\{prospect_name\}\}/g, prospect.name)
      .replace(/\{\{contact_name\}\}/g, prospect.contact_name ?? "there");
    const bod = t.body
      .replace(/\{\{prospect_name\}\}/g, prospect.name)
      .replace(/\{\{contact_name\}\}/g, prospect.contact_name ?? "there");
    setSubject(sub);
    setBody(bod);
  }

  async function analyze() {
    const res = await fetch("/api/anthropic/analyze-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        subject,
        body,
        prospect_context: prospect
          ? `${prospect.name} — ${prospect.notes ?? ""}`
          : "",
        voice_skill: voiceSkill,
      }),
    });
    const data = await res.json();
    setAnalysis(JSON.stringify(data, null, 2));
  }

  async function send() {
    if (!prospectId) return;
    setSending(true);
    const res = await fetch("/api/email/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prospect_id: prospectId, subject, body }),
    });
    const data = await res.json();
    setSending(false);
    if (data.error) alert(data.error);
    else {
      alert("Email sent (or queued).");
      onSent();
    }
  }

  return (
    <div className="mt-6 grid gap-4 lg:grid-cols-2">
      <div className="space-y-3">
        <select
          value={prospectId}
          onChange={(e) => setProspectId(e.target.value)}
          className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm"
        >
          <option value="">Select prospect</option>
          {prospects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
        <select
          onChange={(e) => applyTemplate(e.target.value)}
          className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm"
        >
          <option value="">Template…</option>
          {templates.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
        <input
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Subject"
          className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm"
        />
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={12}
          className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm"
        />
        <div className="flex gap-2">
          <button
            type="button"
            onClick={analyze}
            className="rounded-lg border border-black/10 px-4 py-2 text-sm"
          >
            Analyze tactics
          </button>
          <button
            type="button"
            onClick={send}
            disabled={sending || !prospect?.contact_email}
            className="rounded-lg bg-ink px-4 py-2 text-sm text-white disabled:opacity-40"
          >
            Send
          </button>
        </div>
        {!prospect?.contact_email && prospectId && (
          <p className="text-xs text-ink/50">Add contact email on prospect to send.</p>
        )}
      </div>
      {analysis && (
        <pre className="overflow-auto rounded-xl bg-soft-bg p-4 text-xs text-ink">
          {analysis}
        </pre>
      )}
    </div>
  );
}

function DemosTab({ prospects }: { prospects: Prospect[] }) {
  return (
    <ul className="mt-6 space-y-3">
      {prospects.length === 0 && (
        <p className="text-sm text-ink/50">No demos booked yet.</p>
      )}
      {prospects.map((p) => (
        <li
          key={p.id}
          className="rounded-xl border border-black/5 px-4 py-3"
        >
          <strong>{p.name}</strong>
          {p.demo_at && (
            <p className="text-sm text-ink/60">
              {new Date(p.demo_at).toLocaleString()}
            </p>
          )}
        </li>
      ))}
    </ul>
  );
}

function TemplatesTab({
  teamId,
  templates,
  onChange,
}: {
  teamId: string;
  templates: Template[];
  onChange: () => void;
}) {
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");

  async function save(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/templates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ team_id: teamId, name, subject, body }),
    });
    setName("");
    setSubject("");
    setBody("");
    onChange();
  }

  return (
    <div className="mt-6">
      <ul className="mb-6 space-y-2">
        {templates.map((t) => (
          <li key={t.id} className="rounded-lg border border-black/5 px-3 py-2 text-sm">
            <strong>{t.name}</strong> — {t.subject}
          </li>
        ))}
      </ul>
      <form onSubmit={save} className="space-y-2 max-w-lg">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Template name"
          required
          className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm"
        />
        <input
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Subject"
          required
          className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm"
        />
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Body"
          required
          rows={6}
          className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm"
        />
        <button type="submit" className="rounded-lg bg-ink px-4 py-2 text-sm text-white">
          Save template
        </button>
      </form>
    </div>
  );
}
