import Link from "next/link";

const KIND_LABEL: Record<string, string> = {
  sales: "Outbound · cold sales",
  marketing: "Content + presence",
};

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
  const isSales = kind === "sales";

  return (
    <Link
      href={`/operations/${companySlug}/${teamSlug}`}
      className="studio-card-interactive group block px-7 py-6"
    >
      <div className="mb-[18px] flex items-center gap-3.5 border-b border-black/[0.08] pb-[18px]">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-base transition-transform duration-300 group-hover:scale-105 ${
            isSales
              ? "bg-sage-soft text-sage-deep"
              : "bg-blush-soft text-blush-deep"
          }`}
        >
          {isSales ? "◷" : "✦"}
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-lg font-bold tracking-tight text-ink">{name}</div>
          <div className="mt-0.5 text-xs text-ink/50">
            {KIND_LABEL[kind] ?? kind}
          </div>
        </div>
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-soft-bg text-sm font-semibold text-ink/60 transition-colors group-hover:bg-coral-soft group-hover:text-coral-deep">
          →
        </span>
      </div>

      {description && (
        <p className="mb-4 text-sm leading-relaxed text-ink/65">{description}</p>
      )}

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label}>
            <div className="text-[11px] text-ink/45">{s.label}</div>
            <div className="mt-0.5 text-xl font-bold tabular-nums text-ink">
              {s.value}
            </div>
          </div>
        ))}
      </div>
    </Link>
  );
}
