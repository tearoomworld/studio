import Link from "next/link";
import { Fraunces } from "next/font/google";

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["500"],
});

type Props = {
  slug: string;
  name: string;
  tagline: string | null;
  status: string;
  progress: { percent: number; label: string };
};

export function CompanyCard({
  slug,
  name,
  tagline,
  status,
  progress,
}: Props) {
  const tagClass =
    status === "prototype"
      ? "bg-sage-soft text-sage-deep"
      : "bg-soft-bg text-ink/50";

  const isKindred = slug === "kindred";

  return (
    <Link
      href={`/${slug}`}
      className="studio-card-interactive group flex min-h-[380px] flex-col overflow-hidden"
    >
      {isKindred ? (
        <div
          className={`${fraunces.className} flex h-44 items-center justify-center overflow-hidden bg-coral-soft text-coral-deep transition-transform duration-500 ease-[cubic-bezier(0.34,1.2,0.64,1)] group-hover:scale-[1.03]`}
        >
          <span className="flex items-center gap-3.5 text-[56px] font-medium tracking-tight">
            <span className="h-3.5 w-3.5 rounded-full bg-coral" />
            Kin<em className="italic text-coral">dred</em>
          </span>
        </div>
      ) : (
        <div className="flex h-44 items-center justify-center overflow-hidden bg-ink lowercase tracking-tight text-white transition-transform duration-500 ease-[cubic-bezier(0.34,1.2,0.64,1)] group-hover:scale-[1.03]">
          <span className="text-[64px] font-normal leading-none tracking-tight">
            source<span className="text-sage">.</span>
          </span>
        </div>
      )}

      <div className="flex flex-1 flex-col px-7 pb-7 pt-6">
        <div className="mb-2.5 flex items-start justify-between gap-3">
          <h2 className="text-[22px] font-bold tracking-tight text-ink">
            {name}
          </h2>
          <span
            className={`mt-0.5 shrink-0 rounded-lg px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${tagClass}`}
          >
            {status}
          </span>
        </div>
        <p className="mb-4 text-[13.5px] leading-relaxed text-ink/70">
          {tagline}
        </p>
        <div className="mb-4 border-y border-black/[0.08] py-3.5">
          <div className="mb-2 flex justify-between text-[13px]">
            <span className="font-semibold text-ink">Build progress</span>
            <span className="tabular-nums text-ink/50">{progress.label}</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-black/[0.06]">
            <div
              className={`h-full rounded-full transition-all duration-700 ease-out ${
                isKindred ? "bg-coral" : "bg-sage-deep"
              }`}
              style={{ width: `${progress.percent}%` }}
            />
          </div>
        </div>
        <div className="mt-auto flex items-center justify-between">
          <span className="text-[12.5px] font-semibold text-ink">
            Enter portal
          </span>
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-soft-bg text-base text-ink/45 transition-all duration-300 group-hover:translate-x-0.5 group-hover:bg-coral-soft group-hover:text-coral-deep">
            →
          </span>
        </div>
      </div>
    </Link>
  );
}
