import { readFileSync } from "fs";
import path from "path";

export type PlanItem = {
  t: string;
  tag?: string;
  note?: string;
  link?: string;
  prompt?: string;
  promptEnv?: string;
  promptBash?: string;
  promptSql?: string;
};

export type PlanGroup = { label: string; items: PlanItem[] };

export type PlanPhase = {
  id: string;
  title: string;
  icon?: string;
  desc?: string;
  groups: PlanGroup[];
};

export function parsePlanFromHtml(filePath: string, varName: string): PlanPhase[] {
  const html = readFileSync(filePath, "utf8");
  const re = new RegExp(
    `const\\s+${varName}\\s*=\\s*(\\[[\\s\\S]*?\\]);\\s*\\n`,
  );
  const match = html.match(re);
  if (!match) {
    throw new Error(`Could not find ${varName} in ${filePath}`);
  }
  const plan = new Function(`return (${match[1]});`)() as PlanPhase[];
  return plan;
}

export function planToRows(plan: PlanPhase[]) {
  const phases: {
    order_index: number;
    icon: string | null;
    title: string;
    description: string | null;
    tasks: {
      group_label: string | null;
      order_index: number;
      text: string;
      note: string | null;
      prompt: string | null;
      prompt_type: string | null;
      tag: string | null;
      link: string | null;
    }[];
  }[] = [];

  plan.forEach((phase, pi) => {
    const tasks: (typeof phases)[0]["tasks"] = [];
    let taskOrder = 0;
    for (const group of phase.groups ?? []) {
      for (const item of group.items ?? []) {
        let prompt: string | null = null;
        let prompt_type: string | null = null;
        if (item.prompt) {
          prompt = item.prompt;
          prompt_type = "prompt";
        } else if (item.promptEnv) {
          prompt = item.promptEnv;
          prompt_type = "env";
        } else if (item.promptBash) {
          prompt = item.promptBash;
          prompt_type = "bash";
        } else if (item.promptSql) {
          prompt = item.promptSql;
          prompt_type = "sql";
        }
        tasks.push({
          group_label: group.label ?? null,
          order_index: taskOrder++,
          text: item.t,
          note: item.note ?? null,
          prompt,
          prompt_type,
          tag: item.tag ?? null,
          link: item.link ?? null,
        });
      }
    }
    phases.push({
      order_index: pi,
      icon: phase.icon ?? null,
      title: phase.title,
      description: phase.desc ?? null,
      tasks,
    });
  });

  return phases;
}

export function publicHtmlPath(filename: string) {
  return path.join(process.cwd(), "..", filename);
}
