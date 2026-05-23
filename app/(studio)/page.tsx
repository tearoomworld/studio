import Link from "next/link";
import { StudioLayout } from "@/components/StudioLayout";
import { getCompaniesWithProgress } from "@/lib/data";

export default async function CompaniesPage() {
  const companies = await getCompaniesWithProgress();

  return (
    <StudioLayout>
      <div className="mx-auto max-w-[980px] px-12 py-12">
        <header className="mb-9 border-b border-black/5 pb-6">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-ink/45">
            Studio
          </p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight text-ink">
            Companies in flight.
          </h1>
          <p className="mt-3 max-w-xl text-base text-ink/70">
            Click a company to enter its working portal — build plan, audit,
            agents, and assets in one place.
          </p>
        </header>

        {companies.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-black/10 p-8 text-sm text-ink/60">
            <p>No companies yet. Run the database migration and seed script
            (see README in <code className="text-ink">studio/</code>).</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {companies.map((c) => (
              <Link
                key={c.id}
                href={`/${c.slug}`}
                className="flex gap-5 rounded-[22px] border border-black/5 p-7 transition-shadow hover:shadow-md"
              >
                <CompanyLogo slug={c.slug} name={c.name} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold text-ink">{c.name}</h2>
                    <span className="rounded bg-sage/40 px-2 py-0.5 text-[11px] font-medium capitalize text-ink">
                      {c.status}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-ink/70">
                    {c.tagline}
                  </p>
                  <div className="mt-4">
                    <div className="flex justify-between text-xs font-medium text-ink">
                      <span>Build progress</span>
                      <span>{c.progress.label}</span>
                    </div>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-black/5">
                      <div
                        className="h-full rounded-full bg-sage-deep transition-all"
                        style={{ width: `${c.progress.percent}%` }}
                      />
                    </div>
                  </div>
                  <p className="mt-4 text-sm font-medium text-ink">
                    Enter portal →
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </StudioLayout>
  );
}

function CompanyLogo({ slug, name }: { slug: string; name: string }) {
  if (slug === "kindred") {
    return (
      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-soft-bg font-serif text-lg text-ink">
        Kin<em className="not-italic text-sage-deep">dred</em>
      </div>
    );
  }
  return (
    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-soft-bg text-lg font-medium lowercase tracking-tight text-ink">
      {name}
      <span className="text-sage-deep">.</span>
    </div>
  );
}
