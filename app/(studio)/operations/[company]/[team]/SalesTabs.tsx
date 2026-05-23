"use client";

import { format } from "date-fns";
import { useCallback, useEffect, useMemo, useState } from "react";

export type Prospect = {
  id: string;
  name: string;
  contact_name: string | null;
  contact_email: string | null;
  status: string;
  notes: string | null;
  demo_at: string | null;
  last_touch_at: string | null;
  fit_score: number | null;
  priority: string | null;
  rank_reason: string | null;
};

type Template = {
  id: string;
  name: string;
  subject: string;
  body: string;
};

type SentEmail = {
  id: string;
  subject: string;
  body: string;
  sent_at: string;
  templates?: { name: string } | { name: string }[] | null;
};

type LeadPreview = {
  name: string;
  location?: string;
  contact_name: string | null;
  contact_email: string | null;
  fit_score: number;
  notes: string;
  recommended_angle?: string;
};

const STATUSES = [
  "researching",
  "contacted",
  "replied",
  "demo_booked",
  "won",
  "lost",
] as const;

function statusPillClass(status: string) {
  switch (status) {
    case "researching":
      return "bg-soft-bg text-ink/70";
    case "contacted":
      return "bg-blush-soft text-ink/80";
    case "replied":
      return "bg-sage-soft text-sage-deep";
    case "demo_booked":
      return "bg-ink text-sage";
    case "won":
      return "bg-ink text-white";
    case "lost":
      return "bg-black/5 text-ink/40";
    default:
      return "bg-soft-bg text-ink/60";
  }
}

function statusLabel(status: string) {
  return status.replace(/_/g, " ");
}

function formatTouch(at: string | null) {
  if (!at) return "—";
  const d = new Date(at);
  const days = Math.floor((Date.now() - d.getTime()) / 86400000);
  if (days === 0) return "today";
  if (days === 1) return "yesterday";
  return `${days}d ago`;
}

function applyTemplate(
  t: Template,
  prospect: Prospect,
): { subject: string; body: string } {
  const sub = t.subject
    .replace(/\{\{prospect_name\}\}/g, prospect.name)
    .replace(/\{\{contact_name\}\}/g, prospect.contact_name ?? "there");
  const bod = t.body
    .replace(/\{\{prospect_name\}\}/g, prospect.name)
    .replace(/\{\{contact_name\}\}/g, prospect.contact_name ?? "there");
  return { subject: sub, body: bod };
}

export function SalesTabs({
  teamId,
  voiceSkill,
}: {
  teamId: string;
  voiceSkill: string;
}) {
  const [tab, setTab] = useState<
    "pipeline" | "compose" | "demos" | "templates"
  >("pipeline");
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [composeProspectId, setComposeProspectId] = useState<string | null>(
    null,
  );

  const load = useCallback(async () => {
    const [p, t] = await Promise.all([
      fetch(`/api/prospects?team_id=${teamId}`).then((r) => r.json()),
      fetch(`/api/templates?team_id=${teamId}`).then((r) => r.json()),
    ]);
    if (Array.isArray(p)) setProspects(p);
    if (Array.isArray(t)) setTemplates(t);
  }, [teamId]);

  useEffect(() => {
    load();
  }, [load]);

  const selected = prospects.find((p) => p.id === selectedId) ?? null;

  function openCompose(prospectId: string) {
    setComposeProspectId(prospectId);
    setTab("compose");
  }

  return (
    <div className="mt-8">
      <div className="flex flex-wrap gap-2 rounded-[10px] border border-black/[0.06] bg-soft-bg/80 p-1">
        {(
          [
            ["pipeline", "Pipeline"],
            ["compose", "Compose"],
            ["demos", "Demos"],
            ["templates", "Templates"],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={`rounded-lg px-3.5 py-1.5 text-[13px] font-medium ${
              tab === key
                ? "bg-white text-ink shadow-sm"
                : "text-ink/55 hover:text-ink"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "pipeline" && (
        <PipelineTab
          teamId={teamId}
          voiceSkill={voiceSkill}
          prospects={prospects}
          selected={selected}
          onSelect={setSelectedId}
          onCompose={openCompose}
          onChange={load}
        />
      )}
      {tab === "compose" && (
        <ComposeTab
          prospects={prospects}
          templates={templates}
          voiceSkill={voiceSkill}
          initialProspectId={composeProspectId}
          onSent={() => {
            load();
            setComposeProspectId(null);
          }}
        />
      )}
      {tab === "demos" && (
        <DemosTab
          prospects={prospects.filter((p) => p.status === "demo_booked")}
          onChange={load}
        />
      )}
      {tab === "templates" && (
        <TemplatesTab
          teamId={teamId}
          templates={templates}
          onChange={load}
        />
      )}
    </div>
  );
}

function PipelineTab({
  teamId,
  voiceSkill,
  prospects,
  selected,
  onSelect,
  onCompose,
  onChange,
}: {
  teamId: string;
  voiceSkill: string;
  prospects: Prospect[];
  selected: Prospect | null;
  onSelect: (id: string | null) => void;
  onCompose: (id: string) => void;
  onChange: () => void;
}) {
  const [search, setSearch] = useState("");
  const [name, setName] = useState("");
  const [bulk, setBulk] = useState("");
  const [researchQuery, setResearchQuery] = useState(
    "Atlanta senior living communities · Activities Directors",
  );
  const [busy, setBusy] = useState<string | null>(null);
  const [leadPreview, setLeadPreview] = useState<LeadPreview[]>([]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return prospects;
    return prospects.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.contact_name?.toLowerCase().includes(q) ||
        p.contact_email?.toLowerCase().includes(q) ||
        p.notes?.toLowerCase().includes(q),
    );
  }, [prospects, search]);

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
      const parts = line.split(",").map((s) => s.trim());
      const n = parts[0] || line.trim();
      if (!n) continue;
      await fetch("/api/prospects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          team_id: teamId,
          name: n,
          contact_name: parts[1] || null,
          contact_email: parts[2] || null,
          notes: parts.slice(3).join(", ") || line,
        }),
      });
    }
    setBulk("");
    onChange();
  }

  async function findLeads() {
    setBusy("research");
    setLeadPreview([]);
    const res = await fetch("/api/anthropic/research-leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: researchQuery,
        icp: "Atlanta Activities Directors at senior living communities",
        voice_skill: voiceSkill,
        count: 10,
      }),
    });
    const data = await res.json();
    setBusy(null);
    if (data.error) {
      alert(data.error);
      return;
    }
    setLeadPreview(data.leads ?? []);
  }

  async function importLeads() {
    setBusy("import");
    for (const lead of leadPreview) {
      await fetch("/api/prospects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          team_id: teamId,
          name: lead.name,
          contact_name: lead.contact_name,
          contact_email: lead.contact_email,
          notes: [lead.location, lead.notes, lead.recommended_angle]
            .filter(Boolean)
            .join(" · "),
          fit_score: lead.fit_score,
          rank_reason: lead.recommended_angle ?? null,
          priority:
            lead.fit_score >= 8
              ? "high"
              : lead.fit_score >= 6
                ? "medium"
                : "low",
          status: "researching",
        }),
      });
    }
    setBusy(null);
    setLeadPreview([]);
    onChange();
  }

  async function rankAll() {
    if (!prospects.length) return;
    setBusy("rank");
    const res = await fetch("/api/anthropic/rank-prospects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prospects: prospects.map((p) => ({
          id: p.id,
          name: p.name,
          notes: p.notes,
          status: p.status,
        })),
        voice_skill: voiceSkill,
        persist: true,
      }),
    });
    const data = await res.json();
    setBusy(null);
    if (data.error) {
      alert(data.error);
      return;
    }
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
    <div className="mt-6">
      <div className="rounded-2xl border border-sage/25 bg-sage-soft/30 p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-sage-deep">
          Claude · lead research
        </p>
        <p className="mt-1 text-sm text-ink/60">
          Generate a ranked list of Atlanta communities, import to pipeline, then
          rank again as you add notes.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <input
            value={researchQuery}
            onChange={(e) => setResearchQuery(e.target.value)}
            className="min-w-[220px] flex-1 rounded-lg border border-black/10 bg-white px-3 py-2 text-sm"
            placeholder="Search focus…"
          />
          <button
            type="button"
            disabled={busy === "research"}
            onClick={findLeads}
            className="rounded-lg bg-ink px-4 py-2 text-sm text-white disabled:opacity-50"
          >
            {busy === "research" ? "Searching…" : "Find leads"}
          </button>
          <button
            type="button"
            disabled={!prospects.length || busy === "rank"}
            onClick={rankAll}
            className="rounded-lg border border-black/10 bg-white px-4 py-2 text-sm font-medium"
          >
            {busy === "rank" ? "Ranking…" : "Rank pipeline"}
          </button>
        </div>
        {leadPreview.length > 0 && (
          <div className="mt-4 rounded-xl border border-black/[0.06] bg-white p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-semibold text-ink">
                {leadPreview.length} leads found
              </span>
              <button
                type="button"
                disabled={busy === "import"}
                onClick={importLeads}
                className="text-sm font-semibold text-sage-deep"
              >
                {busy === "import" ? "Importing…" : "Import all →"}
              </button>
            </div>
            <ul className="max-h-48 space-y-2 overflow-auto text-sm">
              {leadPreview.map((l) => (
                <li
                  key={`${l.name}-${l.fit_score}`}
                  className="flex items-start justify-between gap-3 border-b border-black/[0.04] pb-2 last:border-0"
                >
                  <div>
                    <span className="font-medium">{l.name}</span>
                    {l.location && (
                      <span className="ml-2 text-ink/45">{l.location}</span>
                    )}
                    <p className="text-[11px] text-ink/50">{l.notes}</p>
                  </div>
                  <span className="shrink-0 tabular-nums font-semibold text-sage-deep">
                    {l.fit_score}/10
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search prospects…"
          className="min-w-[200px] flex-1 rounded-lg border border-black/10 bg-white px-3 py-2 text-sm"
        />
        <form onSubmit={addOne} className="flex gap-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Community name"
            className="w-44 rounded-lg border border-black/10 px-3 py-2 text-sm"
          />
          <button
            type="submit"
            className="rounded-lg bg-ink px-3 py-2 text-sm text-white"
          >
            + Add
          </button>
        </form>
      </div>

      <details className="mt-3 text-sm">
        <summary className="cursor-pointer text-ink/50 hover:text-ink">
          Bulk paste (name, contact, email, notes…)
        </summary>
        <textarea
          value={bulk}
          onChange={(e) => setBulk(e.target.value)}
          placeholder="Sunrise Manor, Patricia Cole, pcole@…, Decatur GA"
          className="mt-2 w-full rounded-lg border border-black/10 px-3 py-2 text-sm"
          rows={3}
        />
        <button
          type="button"
          onClick={bulkPaste}
          className="mt-2 font-medium text-ink"
        >
          Import lines
        </button>
      </details>

      <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="overflow-hidden rounded-2xl border border-black/[0.06] bg-white">
          <div className="grid grid-cols-[1.4fr_1fr_0.7fr_0.7fr_0.8fr] gap-2 border-b border-black/[0.06] px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wide text-ink/40">
            <div>Name</div>
            <div>Contact</div>
            <div>Fit</div>
            <div>Status</div>
            <div>Last touch</div>
          </div>
          {filtered.length === 0 && (
            <p className="px-4 py-8 text-sm text-ink/45">
              No prospects yet — find leads or add one.
            </p>
          )}
          {filtered.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => onSelect(p.id)}
              className={`grid w-full grid-cols-[1.4fr_1fr_0.7fr_0.7fr_0.8fr] gap-2 border-t border-black/[0.04] px-4 py-3 text-left text-sm transition hover:bg-soft-bg/60 ${
                selected?.id === p.id ? "bg-sage-soft/40" : ""
              }`}
            >
              <div>
                <div className="font-semibold text-ink">{p.name}</div>
                {p.notes && (
                  <div className="mt-0.5 line-clamp-1 text-[11px] text-ink/45">
                    {p.notes}
                  </div>
                )}
              </div>
              <div className="text-ink/70">
                {p.contact_name ? (
                  <>
                    {p.contact_name}
                    {p.contact_email && (
                      <div className="text-[11px] text-ink/40">
                        {p.contact_email}
                      </div>
                    )}
                  </>
                ) : (
                  <span className="text-ink/35">—</span>
                )}
              </div>
              <div className="tabular-nums font-semibold text-sage-deep">
                {p.fit_score != null ? (
                  <>
                    {p.fit_score}
                    {p.priority && (
                      <span className="ml-1 text-[10px] font-normal uppercase text-ink/40">
                        {p.priority}
                      </span>
                    )}
                  </>
                ) : (
                  "—"
                )}
              </div>
              <div>
                <span
                  className={`inline-block rounded px-2 py-0.5 text-[10px] font-semibold capitalize ${statusPillClass(p.status)}`}
                >
                  {statusLabel(p.status)}
                </span>
              </div>
              <div className="text-ink/45">{formatTouch(p.last_touch_at)}</div>
            </button>
          ))}
        </div>

        {selected ? (
          <ProspectPanel
            prospect={selected}
            onClose={() => onSelect(null)}
            onCompose={() => onCompose(selected.id)}
            onUpdate={(patch) => update(selected.id, patch)}
          />
        ) : (
          <div className="flex items-center justify-center rounded-2xl border border-dashed border-black/10 bg-soft-bg/30 p-6 text-center text-sm text-ink/45">
            Click a prospect to see details, email history, and actions.
          </div>
        )}
      </div>
    </div>
  );
}

function ProspectPanel({
  prospect,
  onClose,
  onCompose,
  onUpdate,
}: {
  prospect: Prospect;
  onClose: () => void;
  onCompose: () => void;
  onUpdate: (patch: Partial<Prospect>) => void;
}) {
  const [emails, setEmails] = useState<SentEmail[]>([]);
  const [loadingEmails, setLoadingEmails] = useState(true);
  const [draft, setDraft] = useState({
    contact_name: prospect.contact_name ?? "",
    contact_email: prospect.contact_email ?? "",
    notes: prospect.notes ?? "",
    status: prospect.status,
    demo_at: prospect.demo_at
      ? new Date(prospect.demo_at).toISOString().slice(0, 16)
      : "",
  });

  useEffect(() => {
    setDraft({
      contact_name: prospect.contact_name ?? "",
      contact_email: prospect.contact_email ?? "",
      notes: prospect.notes ?? "",
      status: prospect.status,
      demo_at: prospect.demo_at
        ? new Date(prospect.demo_at).toISOString().slice(0, 16)
        : "",
    });
  }, [prospect]);

  useEffect(() => {
    setLoadingEmails(true);
    fetch(`/api/sent-emails?prospect_id=${prospect.id}`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setEmails(data);
        setLoadingEmails(false);
      });
  }, [prospect.id]);

  function saveContact() {
    onUpdate({
      contact_name: draft.contact_name || null,
      contact_email: draft.contact_email || null,
      notes: draft.notes || null,
      status: draft.status,
      demo_at: draft.demo_at ? new Date(draft.demo_at).toISOString() : null,
    });
  }

  return (
    <aside className="flex max-h-[640px] flex-col rounded-2xl border border-black/[0.06] bg-white shadow-sm">
      <div className="border-b border-black/[0.06] p-4">
        <button
          type="button"
          onClick={onClose}
          className="text-xs text-ink/45 hover:text-ink"
        >
          Close
        </button>
        <h3 className="mt-2 text-lg font-bold text-ink">{prospect.name}</h3>
        {prospect.rank_reason && (
          <p className="mt-1 text-xs leading-relaxed text-ink/55">
            {prospect.rank_reason}
          </p>
        )}
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onCompose}
            className="rounded-lg bg-ink px-3 py-1.5 text-xs font-medium text-white"
          >
            Email this prospect →
          </button>
          <button
            type="button"
            onClick={() => {
              onUpdate({ status: "demo_booked" });
              setDraft((d) => ({ ...d, status: "demo_booked" }));
            }}
            className="rounded-lg border border-black/10 px-3 py-1.5 text-xs"
          >
            Mark demo booked
          </button>
        </div>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        <div className="space-y-2">
          <label className="block text-[10px] font-semibold uppercase tracking-wide text-ink/40">
            Contact
          </label>
          <input
            value={draft.contact_name}
            onChange={(e) =>
              setDraft({ ...draft, contact_name: e.target.value })
            }
            placeholder="Activities Director name"
            className="w-full rounded-lg border border-black/10 px-2.5 py-1.5 text-sm"
          />
          <input
            type="email"
            value={draft.contact_email}
            onChange={(e) =>
              setDraft({ ...draft, contact_email: e.target.value })
            }
            placeholder="email@community.org"
            className="w-full rounded-lg border border-black/10 px-2.5 py-1.5 text-sm"
          />
        </div>
        <div>
          <label className="block text-[10px] font-semibold uppercase tracking-wide text-ink/40">
            Status
          </label>
          <select
            value={draft.status}
            onChange={(e) => setDraft({ ...draft, status: e.target.value })}
            className="mt-1 w-full rounded-lg border border-black/10 px-2.5 py-1.5 text-sm"
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {statusLabel(s)}
              </option>
            ))}
          </select>
        </div>
        {(draft.status === "demo_booked" || draft.demo_at) && (
          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-wide text-ink/40">
              Demo time
            </label>
            <input
              type="datetime-local"
              value={draft.demo_at}
              onChange={(e) => setDraft({ ...draft, demo_at: e.target.value })}
              className="mt-1 w-full rounded-lg border border-black/10 px-2.5 py-1.5 text-sm"
            />
            <p className="mt-1 text-[10px] text-ink/40">
              Syncs to Calendar automatically.
            </p>
          </div>
        )}
        <div>
          <label className="block text-[10px] font-semibold uppercase tracking-wide text-ink/40">
            Notes
          </label>
          <textarea
            value={draft.notes}
            onChange={(e) => setDraft({ ...draft, notes: e.target.value })}
            rows={3}
            className="mt-1 w-full rounded-lg border border-black/10 px-2.5 py-1.5 text-sm"
          />
        </div>
        <button
          type="button"
          onClick={saveContact}
          className="w-full rounded-lg border border-black/10 py-2 text-sm font-medium"
        >
          Save contact & notes
        </button>

        <div>
          <h4 className="text-[10px] font-semibold uppercase tracking-wide text-ink/40">
            Email history
          </h4>
          {loadingEmails && (
            <p className="mt-2 text-xs text-ink/45">Loading…</p>
          )}
          {!loadingEmails && emails.length === 0 && (
            <p className="mt-2 text-xs text-ink/45">
              No emails sent yet. Use Compose to reach out via Resend.
            </p>
          )}
          <ul className="mt-2 space-y-2">
            {emails.map((e) => (
              <li
                key={e.id}
                className="rounded-lg border border-black/[0.05] bg-soft-bg/50 p-2.5"
              >
                <div className="text-[10px] text-ink/45">
                  {new Date(e.sent_at).toLocaleString()}
                </div>
                <div className="text-xs font-semibold text-ink">{e.subject}</div>
                <p className="mt-1 line-clamp-3 text-[11px] leading-relaxed text-ink/60">
                  {e.body}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </aside>
  );
}

function ComposeTab({
  prospects,
  templates,
  voiceSkill,
  initialProspectId,
  onSent,
}: {
  prospects: Prospect[];
  templates: Template[];
  voiceSkill: string;
  initialProspectId: string | null;
  onSent: () => void;
}) {
  const [prospectId, setProspectId] = useState(initialProspectId ?? "");
  const [templateId, setTemplateId] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [analysis, setAnalysis] = useState<{
    used_tactics: string[];
    suggested_tactics: string[];
    overall_score: number;
    reasoning: string;
  } | null>(null);
  const [sending, setSending] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [sentOk, setSentOk] = useState(false);

  useEffect(() => {
    if (initialProspectId) setProspectId(initialProspectId);
  }, [initialProspectId]);

  const prospect = prospects.find((p) => p.id === prospectId);

  function pickTemplate(id: string) {
    setTemplateId(id);
    const t = templates.find((x) => x.id === id);
    if (!t || !prospect) return;
    const applied = applyTemplate(t, prospect);
    setSubject(applied.subject);
    setBody(applied.body);
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
    if (data.error) alert(data.error);
    else setAnalysis(data);
  }

  async function generateWithClaude() {
    if (!prospect) return;
    setGenerating(true);
    const t = templates.find((x) => x.id === templateId) ?? templates[0];
    const res = await fetch("/api/anthropic/generate-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prospect_name: prospect.name,
        prospect_context: prospect.notes ?? "",
        template_subject: t?.subject,
        template_body: t?.body,
        voice_skill: voiceSkill,
      }),
    });
    const data = await res.json();
    setGenerating(false);
    if (data.error) alert(data.error);
    else {
      setSubject(data.subject);
      setBody(data.body);
    }
  }

  async function send() {
    if (!prospectId || !prospect?.contact_email) return;
    setSending(true);
    setSentOk(false);
    const res = await fetch("/api/email/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prospect_id: prospectId,
        subject,
        body,
        template_id: templateId || null,
      }),
    });
    const data = await res.json();
    setSending(false);
    if (data.error) alert(data.error);
    else {
      setSentOk(true);
      onSent();
    }
  }

  return (
    <div className="mt-6">
      {prospect && (
        <div className="mb-4 rounded-xl border border-sage/20 bg-sage-soft/30 px-4 py-3 text-sm">
          <span className="text-ink/55">To </span>
          <strong>{prospect.name}</strong>
          {prospect.contact_name && (
            <span className="text-ink/70"> · {prospect.contact_name}</span>
          )}
          {prospect.contact_email ? (
            <span className="text-ink/50"> ({prospect.contact_email})</span>
          ) : (
            <span className="text-blush-deep"> — add email in pipeline first</span>
          )}
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-[1fr_280px]">
        <div className="space-y-3 rounded-2xl border border-black/[0.06] bg-white p-5">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-xs text-ink/50">
              Prospect
              <select
                value={prospectId}
                onChange={(e) => setProspectId(e.target.value)}
                className="mt-1 w-full rounded-lg border border-black/10 px-3 py-2 text-sm"
              >
                <option value="">Select prospect…</option>
                {prospects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                    {p.contact_email ? "" : " (no email)"}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-xs text-ink/50">
              Template
              <select
                value={templateId}
                onChange={(e) => pickTemplate(e.target.value)}
                className="mt-1 w-full rounded-lg border border-black/10 px-3 py-2 text-sm"
              >
                <option value="">Choose template…</option>
                {templates.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <label className="block text-xs text-ink/50">
            Subject
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="mt-1 w-full rounded-lg border border-black/10 px-3 py-2 text-sm"
            />
          </label>
          <label className="block text-xs text-ink/50">
            Body
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={14}
              className="mt-1 w-full rounded-lg border border-black/10 px-3 py-2 font-mono text-sm leading-relaxed"
            />
          </label>
          <p className="text-[11px] text-ink/40">
            Variables: {"{{contact_name}}"}, {"{{prospect_name}}"} · Voice:{" "}
            <code>{voiceSkill}</code>
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={generateWithClaude}
              disabled={!prospectId || generating}
              className="rounded-lg border border-black/10 px-4 py-2 text-sm disabled:opacity-40"
            >
              {generating ? "Generating…" : "Generate with Claude"}
            </button>
            <button
              type="button"
              onClick={analyze}
              disabled={!subject || !body}
              className="rounded-lg border border-black/10 px-4 py-2 text-sm"
            >
              Analyze tactics
            </button>
            <button
              type="button"
              onClick={send}
              disabled={sending || !prospect?.contact_email || !subject}
              className="rounded-lg bg-ink px-4 py-2 text-sm font-medium text-white disabled:opacity-40"
            >
              {sending ? "Sending…" : "Send via Resend →"}
            </button>
          </div>
          {sentOk && (
            <p className="text-sm text-sage-deep">Sent — logged in email history.</p>
          )}
        </div>

        {analysis ? (
          <aside className="rounded-2xl border border-black/5 bg-soft-bg p-5">
            <h4 className="font-semibold text-ink">Tactic analysis</h4>
            <div className="mt-3 flex items-baseline gap-1">
              <span className="text-3xl font-bold tabular-nums">
                {analysis.overall_score}
              </span>
              <span className="text-sm text-ink/45">/ 10</span>
            </div>
            <div className="mt-4">
              <p className="text-[10px] font-semibold uppercase text-ink/40">
                Used
              </p>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {analysis.used_tactics?.map((t) => (
                  <span
                    key={t}
                    className="rounded bg-sage-soft px-2 py-0.5 text-xs"
                  >
                    ✓ {t}
                  </span>
                ))}
              </div>
            </div>
            <div className="mt-3">
              <p className="text-[10px] font-semibold uppercase text-ink/40">
                Could add
              </p>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {analysis.suggested_tactics?.map((t) => (
                  <span key={t} className="rounded border px-2 py-0.5 text-xs">
                    + {t}
                  </span>
                ))}
              </div>
            </div>
            <p className="mt-4 text-xs leading-relaxed text-ink/55">
              {analysis.reasoning}
            </p>
          </aside>
        ) : (
          <aside className="flex items-center rounded-2xl border border-dashed border-black/10 bg-soft-bg/30 p-5 text-sm text-ink/45">
            Draft an email, then run tactic analysis before you send.
          </aside>
        )}
      </div>
    </div>
  );
}

function DemosTab({
  prospects,
  onChange,
}: {
  prospects: Prospect[];
  onChange: () => void;
}) {
  async function update(id: string, patch: Partial<Prospect>) {
    await fetch(`/api/prospects/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    onChange();
  }

  const sorted = [...prospects].sort((a, b) => {
    const ta = a.demo_at ? new Date(a.demo_at).getTime() : 0;
    const tb = b.demo_at ? new Date(b.demo_at).getTime() : 0;
    return ta - tb;
  });

  return (
    <div className="mt-6">
      <p className="mb-4 text-sm text-ink/55">
        Booked demos auto-sync to your Studio calendar. Add notes after each call.
      </p>
      {sorted.length === 0 && (
        <p className="text-sm text-ink/50">No demos booked yet.</p>
      )}
      <ul className="space-y-3">
        {sorted.map((p) => (
          <li
            key={p.id}
            className="flex gap-4 rounded-2xl border border-black/[0.06] bg-white p-4"
          >
            <div className="w-24 shrink-0 text-center">
              {p.demo_at ? (
                <>
                  <div className="text-xs font-semibold uppercase text-ink/45">
                    {format(new Date(p.demo_at), "EEE · MMM d")}
                  </div>
                  <div className="mt-1 text-lg font-bold tabular-nums text-ink">
                    {format(new Date(p.demo_at), "h:mm a")}
                  </div>
                </>
              ) : (
                <span className="text-xs text-ink/40">No time set</span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <strong className="text-ink">{p.name}</strong>
              {p.contact_name && (
                <span className="text-ink/60"> · {p.contact_name}</span>
              )}
              <textarea
                defaultValue={p.notes ?? ""}
                onBlur={(e) =>
                  update(p.id, { notes: e.target.value || null })
                }
                rows={2}
                placeholder="Demo notes — what they cared about, follow-up…"
                className="mt-2 w-full rounded-lg border border-black/[0.06] bg-soft-bg/50 px-3 py-2 text-sm"
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
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
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    subject: "",
    body: "",
  });

  function startEdit(t: Template) {
    setEditingId(t.id);
    setForm({ name: t.name, subject: t.subject, body: t.body });
  }

  function startNew() {
    setEditingId("new");
    setForm({ name: "", subject: "", body: "" });
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (editingId === "new") {
      await fetch("/api/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ team_id: teamId, ...form }),
      });
    } else if (editingId) {
      await fetch(`/api/templates/${editingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
    }
    setEditingId(null);
    onChange();
  }

  async function remove(id: string) {
    if (!confirm("Delete this template?")) return;
    await fetch(`/api/templates/${id}`, { method: "DELETE" });
    onChange();
  }

  return (
    <div className="mt-6">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-ink/55">
          Reusable cold opens — use {"{{contact_name}}"} and{" "}
          {"{{prospect_name}}"} in Compose.
        </p>
        <button
          type="button"
          onClick={startNew}
          className="rounded-lg bg-ink px-3 py-1.5 text-xs font-medium text-white"
        >
          + New template
        </button>
      </div>

      <ul className="mb-6 space-y-3">
        {templates.map((t) => (
          <li
            key={t.id}
            className="rounded-2xl border border-black/[0.06] bg-white p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <strong className="text-ink">{t.name}</strong>
                <p className="mt-1 text-xs text-ink/50">Subject: {t.subject}</p>
                <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-ink/65">
                  {t.body}
                </p>
              </div>
              <div className="flex shrink-0 gap-2">
                <button
                  type="button"
                  onClick={() => startEdit(t)}
                  className="text-xs font-medium text-ink/60 hover:text-ink"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => remove(t.id)}
                  className="text-xs text-ink/40 hover:text-blush-deep"
                >
                  Delete
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>

      {editingId && (
        <form
          onSubmit={save}
          className="space-y-3 rounded-2xl border border-black/[0.06] bg-soft-bg/50 p-5"
        >
          <h4 className="font-semibold text-ink">
            {editingId === "new" ? "New template" : "Edit template"}
          </h4>
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Template name"
            required
            className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm"
          />
          <input
            value={form.subject}
            onChange={(e) => setForm({ ...form, subject: e.target.value })}
            placeholder="Subject line"
            required
            className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm"
          />
          <textarea
            value={form.body}
            onChange={(e) => setForm({ ...form, body: e.target.value })}
            placeholder="Email body"
            required
            rows={8}
            className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm"
          />
          <div className="flex gap-2">
            <button
              type="submit"
              className="rounded-lg bg-ink px-4 py-2 text-sm text-white"
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => setEditingId(null)}
              className="text-sm text-ink/50"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
