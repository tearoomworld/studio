import Link from "next/link";
import { StudioLayout } from "@/components/StudioLayout";
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
        <header className="mb-8 border-b border-black/5 pb-6">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-ink/45">
            Overview
          </p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight text-ink">
            Operations.
          </h1>
          <p className="mt-3 text-base text-ink/70">
            Companies → teams → tools. Each team kind has its own dashboard.
          </p>
        </header>

        <div className="mb-8 flex gap-2">
          {companies?.map((c) => (
            <Link
              key={c.id}
              href={`/operations?company=${c.slug}`}
              className={`rounded-lg px-4 py-2 text-sm font-medium ${
                c.slug === activeSlug
                  ? "bg-ink text-white"
                  : "bg-black/5 text-ink hover:bg-black/10"
              }`}
            >
              {c.name}
            </Link>
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
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
