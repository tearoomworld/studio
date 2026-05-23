import Link from "next/link";
import { notFound } from "next/navigation";
import { StudioLayout } from "@/components/StudioLayout";
import { SurfaceHead } from "@/components/SurfaceHead";
import { getTeamStats } from "@/lib/data";
import { createClient } from "@/lib/supabase/server";
import { SalesTabs } from "./SalesTabs";
import { MarketingTabs } from "./MarketingTabs";

export default async function TeamDashboardPage({
  params,
}: {
  params: Promise<{ company: string; team: string }>;
}) {
  const { company: companySlug, team: teamSlug } = await params;
  const supabase = await createClient();

  const { data: company } = await supabase
    .from("companies")
    .select("*")
    .eq("slug", companySlug)
    .maybeSingle();

  if (!company) notFound();

  const { data: team } = await supabase
    .from("teams")
    .select("*")
    .eq("company_id", company.id)
    .eq("slug", teamSlug)
    .maybeSingle();

  if (!team) notFound();

  const stats = await getTeamStats(team.id, team.kind);

  const motionCopy =
    team.kind === "sales"
      ? `${company.name} Sales runs ${company.motion} motion. Outbound to Activities Directors; voice skill ${company.voice_skill} shapes every Claude call.`
      : `${company.name} Marketing runs ${company.motion} motion. Content + presence; voice skill ${company.voice_skill} shapes every Claude call.`;

  return (
    <StudioLayout>
      <div className="mx-auto max-w-[980px] px-12 py-12">
        <Link
          href={`/operations?company=${companySlug}`}
          className="text-sm text-ink/50 hover:text-ink"
        >
          ← {company.name} · all teams
        </Link>
        <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-ink/45">
          {team.kind}
        </p>
        <SurfaceHead
          eyebrow="Overview"
          title={`${team.name}.`}
          subtitle={
            team.kind === "sales"
              ? "Outbound to Activities Directors — find leads, rank pipeline, email from templates, track every send. Demos sync to Calendar."
              : `${company.name} marketing — content calendar and field presence.`
          }
        />

        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          {stats.map((s) => (
            <div
              key={s.label}
              className="rounded-2xl border border-black/5 bg-soft-bg/50 p-5"
            >
              <div className="text-xs text-ink/45">{s.label}</div>
              <div className="mt-1 text-2xl font-bold tabular-nums text-ink">
                {s.value}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 rounded-2xl border border-black/5 bg-soft-bg/30 p-6">
          <h3 className="font-semibold text-ink">Motion · how this team works</h3>
          <p className="mt-2 text-sm leading-relaxed text-ink/75">{motionCopy}</p>
        </div>

        {team.kind === "sales" ? (
          <SalesTabs teamId={team.id} voiceSkill={company.voice_skill} />
        ) : (
          <MarketingTabs teamId={team.id} voiceSkill={company.voice_skill} />
        )}
      </div>
    </StudioLayout>
  );
}
