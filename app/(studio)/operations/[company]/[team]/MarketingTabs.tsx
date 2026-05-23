"use client";

import { useCallback, useEffect, useState } from "react";

type Idea = {
  id: string;
  title: string;
  body: string | null;
  channel: string;
  format: string | null;
  status: string;
  scheduled_for: string | null;
  generated_by_ai: boolean;
};

export function MarketingTabs({
  teamId,
  voiceSkill,
}: {
  teamId: string;
  voiceSkill: string;
}) {
  const [tab, setTab] = useState("ideas");
  const [ideas, setIdeas] = useState<Idea[]>([]);

  const load = useCallback(async () => {
    const data = await fetch(`/api/content-ideas?team_id=${teamId}`).then(
      (r) => r.json(),
    );
    setIdeas(data);
  }, [teamId]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="mt-8">
      <div className="flex flex-wrap gap-2 border-b border-black/5 pb-2">
        {(
          [
            ["calendar", "Content calendar"],
            ["ideas", "Idea pool"],
            ["generator", "Idea generator"],
            ["field", "Field log"],
            ["hosts", "Host scouting"],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
              tab === key ? "bg-ink text-white" : "text-ink/60"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "calendar" && (
        <IdeaList
          ideas={ideas.filter((i) => i.scheduled_for && i.status === "scheduled")}
          empty="No scheduled posts."
        />
      )}
      {tab === "ideas" && (
        <IdeaPool ideas={ideas.filter((i) => i.status === "idea")} onChange={load} />
      )}
      {tab === "generator" && (
        <Generator teamId={teamId} voiceSkill={voiceSkill} onSaved={load} />
      )}
      {(tab === "field" || tab === "hosts") && (
        <p className="mt-6 text-sm text-ink/50">Phase 1 — not built yet.</p>
      )}
    </div>
  );
}

function IdeaList({ ideas, empty }: { ideas: Idea[]; empty: string }) {
  if (!ideas.length) return <p className="mt-6 text-sm text-ink/50">{empty}</p>;
  return (
    <ul className="mt-6 space-y-2">
      {ideas.map((i) => (
        <li key={i.id} className="rounded-lg border border-black/5 px-4 py-3 text-sm">
          <strong>{i.title}</strong>
          <span className="ml-2 text-ink/45">{i.scheduled_for}</span>
        </li>
      ))}
    </ul>
  );
}

function IdeaPool({
  ideas,
  onChange,
}: {
  ideas: Idea[];
  onChange: () => void;
}) {
  async function schedule(id: string) {
    const date = prompt("Schedule date (YYYY-MM-DD)?");
    if (!date) return;
    await fetch(`/api/content-ideas/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "scheduled", scheduled_for: date }),
    });
    onChange();
  }

  return (
    <div className="mt-6 space-y-3">
      {ideas.length === 0 && (
        <p className="text-sm text-ink/50">Pool is empty. Generate ideas first.</p>
      )}
      {ideas.map((i) => (
        <div key={i.id} className="rounded-xl border border-black/5 p-4">
          <strong className="text-ink">{i.title}</strong>
          {i.body && <p className="mt-2 text-sm text-ink/70">{i.body}</p>}
          <button
            type="button"
            onClick={() => schedule(i.id)}
            className="mt-3 text-sm font-medium text-sage-deep"
          >
            Schedule →
          </button>
        </div>
      ))}
    </div>
  );
}

function Generator({
  teamId,
  voiceSkill,
  onSaved,
}: {
  teamId: string;
  voiceSkill: string;
  onSaved: () => void;
}) {
  const [prompt, setPrompt] = useState(
    "3 IG carousel ideas about atlanta listening sessions, lowercase voice",
  );
  const [results, setResults] = useState<
    { title: string; body: string; format: string; channel: string }[]
  >([]);

  async function generate() {
    const res = await fetch("/api/anthropic/generate-content", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, count: 3, voice_skill: voiceSkill }),
    });
    const data = await res.json();
    if (data.ideas) setResults(data.ideas);
    else alert(data.error ?? "Failed");
  }

  async function save(idea: (typeof results)[0]) {
    await fetch("/api/content-ideas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        team_id: teamId,
        channel: idea.channel || "instagram",
        format: idea.format,
        title: idea.title,
        body: idea.body,
        status: "idea",
        generated_by_ai: true,
      }),
    });
    onSaved();
  }

  return (
    <div className="mt-6 grid gap-6 lg:grid-cols-2">
      <div>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={5}
          className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm"
        />
        <p className="mt-2 text-xs text-ink/45">Voice: {voiceSkill}</p>
        <button
          type="button"
          onClick={generate}
          className="mt-3 rounded-lg bg-ink px-4 py-2 text-sm text-white"
        >
          ✦ Generate ideas
        </button>
      </div>
      <div className="space-y-3">
        {results.map((idea, i) => (
          <div key={i} className="rounded-xl border border-black/5 p-4">
            <strong>{idea.title}</strong>
            <p className="mt-2 text-sm text-ink/70">{idea.body}</p>
            <button
              type="button"
              onClick={() => save(idea)}
              className="mt-3 text-sm font-medium"
            >
              + Save to pool
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
