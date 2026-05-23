export function SettingsCard({
  title,
  intro,
  rows,
}: {
  title: string;
  intro?: string;
  rows: { label: string; value: React.ReactNode }[];
}) {
  return (
    <div className="studio-card mb-4 p-7">
      <h3 className="text-xl font-bold tracking-tight text-ink">{title}</h3>
      {intro && (
        <p className="mt-2 mb-4 text-sm leading-relaxed text-ink/70">{intro}</p>
      )}
      <div className={intro ? "" : "mt-4"}>
        {rows.map((row) => (
          <div
            key={row.label}
            className="grid gap-4 border-b border-black/[0.06] py-4 last:border-0 md:grid-cols-[200px_1fr] md:gap-6"
          >
            <div className="text-[13px] font-semibold text-ink">{row.label}</div>
            <SettingsValue>{row.value}</SettingsValue>
          </div>
        ))}
      </div>
    </div>
  );
}

function SettingsValue({ children }: { children: React.ReactNode }) {
  if (typeof children === "string") {
    return (
      <p className="text-[13px] leading-relaxed text-ink/80">
        {children.split(/(`[^`]+`)/g).map((part, i) =>
          part.startsWith("`") && part.endsWith("`") ? (
            <code
              key={i}
              className="mx-0.5 rounded bg-soft-bg px-1.5 py-0.5 font-mono text-xs"
            >
              {part.slice(1, -1)}
            </code>
          ) : (
            <span key={i}>{part}</span>
          ),
        )}
      </p>
    );
  }
  return <div className="text-[13px] leading-relaxed text-ink/80">{children}</div>;
}
