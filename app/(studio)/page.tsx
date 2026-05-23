import Link from "next/link";
import { CompanyCard } from "@/components/CompanyCard";
import { StudioLayout } from "@/components/StudioLayout";
import { StudioQuickNav } from "@/components/StudioTile";
import { SurfaceHead } from "@/components/SurfaceHead";
import { getCompaniesWithProgress } from "@/lib/data";

export default async function PrototypesPage() {
  const companies = await getCompaniesWithProgress();

  return (
    <StudioLayout>
      <div className="mx-auto max-w-[1040px] px-12 py-12">
        <SurfaceHead
          eyebrow="Studio"
          title="Prototypes in flight."
          subtitle="Open a prototype to work in its portal — build plan, audit, agents, and every asset in one place. The Studio shell is the strategic layer; each portal is where the work happens."
        />

        <StudioQuickNav />

        {companies.length === 0 ? (
          <div className="studio-card border-dashed p-8 text-sm text-ink/60">
            <p>
              No prototypes yet. Run the database migration and seed script (see
              README in <code className="text-ink">studio/</code>).
            </p>
          </div>
        ) : (
          <>
            <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.08em] text-ink/40">
              Your prototypes
            </p>
            <div className="grid gap-5 md:grid-cols-2">
              {companies.map((c) => (
                <CompanyCard
                  key={c.id}
                  slug={c.slug}
                  name={c.name}
                  tagline={c.tagline}
                  status={c.status ?? "prototype"}
                  progress={c.progress}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </StudioLayout>
  );
}
