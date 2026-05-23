-- Studio-managed WebAuthn (Touch ID) — does not require Supabase Auth passkeys feature.

create table if not exists public.webauthn_challenges (
  id uuid primary key default gen_random_uuid(),
  challenge text not null unique,
  type text not null check (type in ('registration', 'authentication')),
  user_id uuid references auth.users (id) on delete cascade,
  expires_at timestamptz not null default (now() + interval '5 minutes')
);

create index if not exists webauthn_challenges_expires_idx
  on public.webauthn_challenges (expires_at);

create table if not exists public.webauthn_credentials (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  credential_id text not null unique,
  public_key bytea not null,
  counter bigint not null default 0,
  transports text[] not null default '{}',
  created_at timestamptz not null default now()
);

create index if not exists webauthn_credentials_user_idx
  on public.webauthn_credentials (user_id);

alter table public.webauthn_challenges enable row level security;
alter table public.webauthn_credentials enable row level security;
