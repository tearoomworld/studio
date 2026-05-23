import Link from "next/link";

export function TeamCard({
  companySlug,
  teamSlug,
  name,
  kind,
  description,
  stats,
}: {
  companySlug: string;
  teamSlug: string;
  name: string;
  kind: string;
  description: string | null;
  stats: { label: string; value: string | number }[];
}) {
  const accent = kind === "marketing" ? "bg-blush/30" : "bg-sage/50";

  return (
    <Link
      href={`/operations/${companySlug}/${teamSlug}`}
      className="block rounded-2xl border border-black/5 p-6 transition-shadow hover:shadow-md"
    >
      <div className={`mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg ${accent} text-lg`}>
        {kind === "sales" ? "◎" : "✦"}
      </div>
      <div className="text-xs font-semibold uppercase tracking-wide text-ink/45">
        {kind}
      </div>
      <h3 className="mt-1 text-xl font-semibold text-ink">{name}</h3>
      {description && (
        <p className="mt-2 text-sm leading-relaxed text-ink/65">
          {description}
        </p>
      )}
      <div className="mt-5 grid grid-cols-2 gap-3">
        {stats.map((s) => (
          <div key={s.label}>
            <div className="text-[11px] text-ink/45">{s.label}</div>
            <div className="text-lg font-semibold tabular-nums text-ink">
              {s.value}
            </div>
          </div>
        ))}
      </div>
    </Link>
  );
}
