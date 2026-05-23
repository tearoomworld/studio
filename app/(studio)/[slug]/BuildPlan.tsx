"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Phase = {
  id: string;
  title: string;
  icon: string | null;
  description: string | null;
  tasks: {
    id: string;
    group_label: string | null;
    text: string;
    done: boolean;
    tag: string | null;
  }[];
};

export function BuildPlan({ phases }: { phases: Phase[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);

  async function toggle(taskId: string, done: boolean) {
    setBusy(taskId);
    await fetch(`/api/tasks/${taskId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ done: !done }),
    });
    setBusy(null);
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-3xl px-8 py-10">
      <h1 className="text-3xl font-bold text-ink">Build plan</h1>
      <p className="mt-2 text-sm text-ink/60">
        Check off tasks as you complete them. Progress syncs to Studio home.
      </p>
      <div className="mt-8 space-y-8">
        {phases.map((phase) => (
          <section key={phase.id}>
            <h2 className="flex items-center gap-2 text-lg font-semibold text-ink">
              {phase.icon && (
                <span className="flex h-7 w-7 items-center justify-center rounded-md bg-sage/50 text-sm">
                  {phase.icon}
                </span>
              )}
              {phase.title}
            </h2>
            {phase.description && (
              <p className="mt-2 text-sm leading-relaxed text-ink/65">
                {phase.description}
              </p>
            )}
            <ul className="mt-4 space-y-2">
              {phase.tasks.map((task) => (
                <li
                  key={task.id}
                  className="flex items-start gap-3 rounded-lg border border-black/5 px-3 py-2.5"
                >
                  <button
                    type="button"
                    disabled={busy === task.id}
                    onClick={() => toggle(task.id, task.done)}
                    className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border ${
                      task.done
                        ? "border-sage-deep bg-sage text-ink"
                        : "border-black/20 bg-white"
                    }`}
                  >
                    {task.done ? "✓" : ""}
                  </button>
                  <div>
                    <span
                      className={
                        task.done ? "text-ink/45 line-through" : "text-ink"
                      }
                    >
                      {task.text}
                    </span>
                    {task.tag && (
                      <span className="ml-2 text-[10px] uppercase text-sage-deep">
                        {task.tag}
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
