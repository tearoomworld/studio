export function SurfaceHead({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <header className="mb-10 border-b border-black/[0.08] pb-7">
      <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-ink/40">
        {eyebrow}
      </p>
      <h1 className="mt-2 text-[2.75rem] font-bold leading-[1.05] tracking-tight text-ink">
        {title}
      </h1>
      {subtitle && (
        <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-ink/70">
          {subtitle}
        </p>
      )}
    </header>
  );
}
