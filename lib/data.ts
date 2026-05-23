import { createClient } from "@/lib/supabase/server";
import { computeProgress } from "./progress";

export async function getCompaniesWithProgress() {
  const supabase = await createClient();
  const { data: companies } = await supabase
    .from("companies")
    .select("*")
    .order("order_index");

  if (!companies?.length) return [];

  const result = [];
  for (const c of companies) {
    const { data: phases } = await supabase
      .from("phases")
      .select("id")
      .eq("company_id", c.id);
    const phaseIds = phases?.map((p) => p.id) ?? [];
    let tasks: { phase_id: string; done: boolean }[] = [];
    if (phaseIds.length) {
      const { data: t } = await supabase
        .from("tasks")
        .select("phase_id, done")
        .in("phase_id", phaseIds);
      tasks = t ?? [];
    }
    result.push({
      ...c,
      progress: computeProgress(phases ?? [], tasks),
    });
  }
  return result;
}

export async function getTeamStats(teamId: string, kind: string) {
  const supabase = await createClient();

  if (kind === "sales") {
    const { data: prospects } = await supabase
      .from("prospects")
      .select("status")
      .eq("team_id", teamId);

    const list = prospects ?? [];
    const contacted = list.filter((p) =>
      ["contacted", "replied", "demo_booked", "won"].includes(p.status),
    ).length;
    const replied = list.filter((p) =>
      ["replied", "demo_booked", "won"].includes(p.status),
    ).length;
    const replyRate =
      contacted > 0 ? Math.round((replied / contacted) * 100) : 0;

    const prospectIds = (
      await supabase.from("prospects").select("id").eq("team_id", teamId)
    ).data?.map((p) => p.id) ?? [];
    let emailsSent = 0;
    if (prospectIds.length) {
      const { count } = await supabase
        .from("sent_emails")
        .select("*", { count: "exact", head: true })
        .in("prospect_id", prospectIds);
      emailsSent = count ?? 0;
    }

    const demos = list.filter((p) => p.status === "demo_booked").length;

    return [
      { label: "Leads", value: list.length },
      { label: "Emails sent", value: emailsSent },
      { label: "Demos booked", value: demos },
      { label: "Reply rate", value: `${replyRate}%` },
    ];
  }

  const { data: ideas } = await supabase
    .from("content_ideas")
    .select("status, updated_at")
    .eq("team_id", teamId);

  const list = ideas ?? [];
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const posted7d = list.filter(
    (i) =>
      i.status === "posted" &&
      new Date(i.updated_at).getTime() > weekAgo,
  ).length;

  return [
    { label: "Ideas in pool", value: list.filter((i) => i.status === "idea").length },
    { label: "Posts scheduled", value: list.filter((i) => i.status === "scheduled").length },
    { label: "Posted 7d", value: posted7d },
    { label: "Field events 7d", value: 0 },
  ];
}
