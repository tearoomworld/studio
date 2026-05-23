export type SettingsRow = { label: string; value: React.ReactNode };

export const STUDIO_DEFAULTS: SettingsRow[] = [
  {
    label: "Stack",
    value:
      "`Next.js 15` · `Supabase` · `Vercel` · `Resend` · `Anthropic API` · Stripe (Connect for marketplaces) · Daily.co or Capacitor as needed",
  },
  {
    label: "Monorepo",
    value:
      "pnpm workspaces. Three apps per company: `web`, `app` (or `hosts`), `admin` (or `dashboard`). Shared packages: `ui`, `db`, `lib`.",
  },
  {
    label: "Database",
    value:
      "Postgres on Supabase. RLS on every table. Money in cents (integers, never floats). UUIDs for primary keys.",
  },
  {
    label: "Auth",
    value:
      "Magic-link via Supabase. `users.user_type` enum from day one — even if v1 has one role, v2 adds more.",
  },
  {
    label: "Email subdomains",
    value:
      "`hello@[company].care` for sales. `notifications.[company].care` for transactional. Separate from day one.",
  },
  {
    label: "Feature flags",
    value:
      "Every v2 surface gates behind a flag on the relevant scope (community, city, venue). Default false. Flip per-customer.",
  },
];

export const FOUNDER_PROFILE: SettingsRow[] = [
  { label: "Name", value: "Ayesha" },
  { label: "Education", value: "Georgia Tech · engineering + design" },
  { label: "Background", value: "A few years in tech before founding" },
  {
    label: "Personal wedge (Kindred)",
    value: "Caretaker for grandma — origin of Kindred",
  },
  {
    label: "Personal wedge (Source)",
    value: "Helping atlanta event organizers as friends-of-friends for years",
  },
  { label: "Location", value: "Atlanta, GA · solo founder" },
];

export const COMPATIBILITY_RULES: SettingsRow[] = [
  {
    label: "v2 tables in v1",
    value:
      "All defined, empty. Never `ALTER TABLE ADD` on a live system you can avoid.",
  },
  {
    label: "Polymorphic columns",
    value: "Polymorphic from day one. Type columns even when v1 has one value.",
  },
  {
    label: "Schema additions",
    value: "Nullable + defaulted. v1 code never writes them.",
  },
  {
    label: "No premature user surfaces",
    value:
      "If a feature requires a user type that doesn't exist yet, it's a v2 feature. Don't sneak in.",
  },
  {
    label: "Agent budgets",
    value:
      "Every Anthropic API call wrapped. Per-endpoint daily cap. Slack alert at 80%.",
  },
];
