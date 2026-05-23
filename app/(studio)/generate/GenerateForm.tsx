"use client";

import { useState } from "react";

export function GenerateForm() {
  const [idea, setIdea] = useState("");
  const [motion, setMotion] = useState("sprint");
  const [aesthetic, setAesthetic] = useState("");
  const [v2, setV2] = useState("");
  const [wedge, setWedge] = useState("");
  const [output, setOutput] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const meta = `# New company meta-prompt

## Idea
${idea}

## GTM motion
${motion}

## Aesthetic / brand direction
${aesthetic || "(not specified)"}

## v2 vision (dormant tables, do not build yet)
${v2 || "(not specified)"}

## Wedge / first buyer
${wedge || "(not specified)"}

---
Copy into Claude Code. Follow META_PLAYBOOK.md: locked stack, seven compatibility rules, portal + Studio shell, honest empty states.`;
    setOutput(meta);
  }

  return (
    <>
      <form onSubmit={submit} className="space-y-4">
        <label className="block text-sm">
          <span className="text-ink/50">Idea</span>
          <textarea
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            required
            rows={3}
            className="mt-1 w-full rounded-lg border border-black/10 px-3 py-2"
          />
        </label>
        <label className="block text-sm">
          <span className="text-ink/50">Motion</span>
          <select
            value={motion}
            onChange={(e) => setMotion(e.target.value)}
            className="mt-1 w-full rounded-lg border border-black/10 px-3 py-2"
          >
            <option value="sprint">sprint</option>
            <option value="marathon">marathon</option>
            <option value="paid">paid</option>
            <option value="partnerships">partnerships</option>
          </select>
        </label>
        <label className="block text-sm">
          <span className="text-ink/50">Aesthetic</span>
          <textarea
            value={aesthetic}
            onChange={(e) => setAesthetic(e.target.value)}
            rows={2}
            className="mt-1 w-full rounded-lg border border-black/10 px-3 py-2"
          />
        </label>
        <label className="block text-sm">
          <span className="text-ink/50">v2 vision</span>
          <textarea
            value={v2}
            onChange={(e) => setV2(e.target.value)}
            rows={2}
            className="mt-1 w-full rounded-lg border border-black/10 px-3 py-2"
          />
        </label>
        <label className="block text-sm">
          <span className="text-ink/50">Wedge</span>
          <input
            value={wedge}
            onChange={(e) => setWedge(e.target.value)}
            className="mt-1 w-full rounded-lg border border-black/10 px-3 py-2"
          />
        </label>
        <button
          type="submit"
          className="rounded-lg bg-ink px-4 py-2.5 text-sm font-medium text-white"
        >
          Generate meta-prompt
        </button>
      </form>
      {output && (
        <pre className="mt-8 overflow-auto rounded-xl bg-soft-bg p-4 text-xs leading-relaxed text-ink">
          {output}
        </pre>
      )}
    </>
  );
}
