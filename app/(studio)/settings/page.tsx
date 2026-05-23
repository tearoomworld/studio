import { StudioLayout } from "@/components/StudioLayout";

export default function SettingsPage() {
  return (
    <StudioLayout>
      <div className="mx-auto max-w-[720px] px-12 py-12">
        <header className="mb-8 border-b border-black/5 pb-6">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-ink/45">
            System
          </p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight text-ink">
            Settings.
          </h1>
          <p className="mt-3 text-sm text-ink/50">Read-only in Phase 0.</p>
        </header>

        <div className="space-y-4">
          <Card title="Studio defaults">
            <ul className="list-inside list-disc text-sm text-ink/70">
              <li>Next.js 15 · Supabase · Vercel · Resend · Anthropic</li>
              <li>pnpm workspaces pattern per company (deferred)</li>
            </ul>
          </Card>
          <Card title="Founder profile">
            <p className="text-sm text-ink/80">
              <strong>Ayesha</strong> — solo founder, Atlanta. GT + tech background;
              Kindred founder story references grandmother caretaker experience.
              Education and location are the single source of truth for all company
              voice and outbound copy.
            </p>
          </Card>
          <Card title="Compatibility rules">
            <ol className="list-decimal list-inside space-y-1 text-sm text-ink/70">
              <li>All v2 tables exist in v1 (empty)</li>
              <li>Polymorphic columns from day one</li>
              <li>Typed users via user_type enum</li>
              <li>Feature flags on every surface</li>
              <li>Email subdomains by purpose</li>
              <li>Nullable schema additions</li>
              <li>No premature user surfaces</li>
            </ol>
          </Card>
        </div>
      </div>
    </StudioLayout>
  );
}

function Card({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-black/5 p-6">
      <h3 className="font-semibold text-ink">{title}</h3>
      <div className="mt-3">{children}</div>
    </div>
  );
}
