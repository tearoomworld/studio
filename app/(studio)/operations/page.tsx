import Link from "next/link";
import { StudioLayout } from "@/components/StudioLayout";
import { SurfaceHead } from "@/components/SurfaceHead";
import { TeamCard } from "@/components/TeamCard";
import { PhaseOneButton } from "@/components/PhaseOneButton";
import { getTeamStats } from "@/lib/data";
import { createClient } from "@/lib/supabase/server";

export default async function OperationsPage({
  searchParams,
}: {
  searchParams: Promise<{ company?: string }>;
}) {
  const { company: companySlug } = await searchParams;
  const supabase = await createClient();

  const { data: companies } = await supabase
    .from("companies")
    .select("*")
    .order("order_index");

  const activeSlug = companySlug ?? companies?.[0]?.slug ?? "kindred";
  const activeCompany = companies?.find((c) => c.slug === activeSlug);

  const { data: teams } = activeCompany
    ? await supabase
        .from("teams")
        .select("*")
        .eq("company_id", activeCompany.id)
        .order("order_index")
    : { data: [] };

  const teamsWithStats = await Promise.all(
    (teams ?? []).map(async (t) => ({
      ...t,
      stats: await getTeamStats(t.id, t.kind),
    })),
  );

  return (
    <StudioLayout>
      <div className="mx-auto max-w-[980px] px-12 py-12">
        <SurfaceHead
          eyebrow="Overview"
          title="Operations."
          subtitle="Each company has teams. Each team has a dashboard scoped to its work. Click into a team to see leads, emails sent, templates, content scheduled — as you grow, you add teams (or hire someone into one)."
        />

        <div className="mb-8 inline-flex gap-1 rounded-2xl border border-black/[0.08] bg-cream-deep p-1">
          {companies?.map((c) => (
            <Link
              key={c.id}
              href={`/operations?company=${c.slug}`}
              className={`rounded-xl px-4 py-2 text-[12.5px] font-medium transition-all duration-300 ${
                c.slug === activeSlug
                  ? "studio-pill-coral"
                  : "text-ink/50 hover:bg-white/60 hover:text-ink"
              }`}
            >
              {c.name}
            </Link>
          ))}
        </div>

        <div className="flex flex-col gap-3">
          {teamsWithStats.map((t) => (
            <TeamCard
              key={t.id}
              companySlug={activeSlug}
              teamSlug={t.slug}
              name={t.name}
              kind={t.kind}
              description={t.description}
              stats={t.stats}
            />
          ))}
        </div>

        <PhaseOneButton
          label={`+ Add a team to ${activeCompany?.name ?? "this company"}`}
        />
      </div>
    </StudioLayout>
  );
}
