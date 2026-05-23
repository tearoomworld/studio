export type ProgressStats = {
  percent: number;
  completedPhases: number;
  totalPhases: number;
  label: string;
};

export function computeProgress(
  phases: { id: string }[],
  tasks: { phase_id: string; done: boolean }[],
): ProgressStats {
  const totalPhases = phases.length;
  if (totalPhases === 0) {
    return { percent: 0, completedPhases: 0, totalPhases: 0, label: "0% · 0/0 phases" };
  }

  const tasksByPhase = new Map<string, { total: number; done: number }>();
  for (const t of tasks) {
    const cur = tasksByPhase.get(t.phase_id) ?? { total: 0, done: 0 };
    cur.total += 1;
    if (t.done) cur.done += 1;
    tasksByPhase.set(t.phase_id, cur);
  }

  let completedPhases = 0;
  for (const p of phases) {
    const stats = tasksByPhase.get(p.id);
    if (stats && stats.total > 0 && stats.done === stats.total) {
      completedPhases += 1;
    }
  }

  const totalTasks = tasks.length;
  const doneTasks = tasks.filter((t) => t.done).length;
  const percent =
    totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  return {
    percent,
    completedPhases,
    totalPhases,
    label: `${percent}% · ${completedPhases}/${totalPhases} phases`,
  };
}
