-- Studio Phase 0 schema
-- Run in Supabase SQL Editor if not using CLI

create table companies (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  tagline text,
  status text default 'prototype',
  motion text not null,
  estimated_weeks int,
  brand jsonb,
  voice_skill text,
  order_index int default 0,
  created_at timestamptz default now()
);

create table phases (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references companies on delete cascade not null,
  order_index int not null,
  icon text,
  title text not null,
  description text,
  created_at timestamptz default now()
);

create table tasks (
  id uuid primary key default gen_random_uuid(),
  phase_id uuid references phases on delete cascade not null,
  group_label text,
  order_index int not null,
  text text not null,
  note text,
  prompt text,
  prompt_type text,
  tag text,
  link text,
  done boolean default false,
  done_at timestamptz,
  created_at timestamptz default now()
);

create table ledger_entries (
  id uuid primary key default gen_random_uuid(),
  status text not null,
  title text not null,
  body text,
  company_slug text,
  order_index int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table teams (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references companies on delete cascade not null,
  slug text not null,
  name text not null,
  kind text not null,
  description text,
  order_index int default 0,
  created_at timestamptz default now(),
  unique (company_id, slug)
);

create table prospects (
  id uuid primary key default gen_random_uuid(),
  team_id uuid references teams on delete cascade not null,
  name text not null,
  contact_name text,
  contact_email text,
  status text default 'researching',
  notes text,
  demo_at timestamptz,
  last_touch_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table templates (
  id uuid primary key default gen_random_uuid(),
  team_id uuid references teams on delete cascade not null,
  name text not null,
  subject text not null,
  body text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table sent_emails (
  id uuid primary key default gen_random_uuid(),
  prospect_id uuid references prospects on delete cascade not null,
  template_id uuid references templates on delete set null,
  subject text not null,
  body text not null,
  resend_id text,
  sent_at timestamptz default now()
);

create table content_ideas (
  id uuid primary key default gen_random_uuid(),
  team_id uuid references teams on delete cascade not null,
  channel text not null,
  format text,
  title text not null,
  body text,
  scheduled_for date,
  status text default 'idea',
  generated_by_ai boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table assets (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references companies on delete cascade not null,
  kind text not null,
  name text not null,
  storage_path text not null,
  mime_type text,
  size_bytes int,
  uploaded_at timestamptz default now()
);

create table calendar_events (
  id uuid primary key default gen_random_uuid(),
  source_kind text not null,
  source_id uuid,
  company_id uuid references companies on delete cascade,
  title text not null,
  description text,
  starts_at timestamptz not null,
  ends_at timestamptz,
  location text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index calendar_events_starts_at_idx on calendar_events (starts_at);
create unique index calendar_events_source_unique on calendar_events (source_kind, source_id)
  where source_id is not null;

alter table companies enable row level security;
alter table phases enable row level security;
alter table tasks enable row level security;
alter table ledger_entries enable row level security;
alter table teams enable row level security;
alter table prospects enable row level security;
alter table templates enable row level security;
alter table sent_emails enable row level security;
alter table content_ideas enable row level security;
alter table assets enable row level security;
alter table calendar_events enable row level security;

create policy "founder access" on companies for all using (auth.uid() is not null);
create policy "founder access" on phases for all using (auth.uid() is not null);
create policy "founder access" on tasks for all using (auth.uid() is not null);
create policy "founder access" on ledger_entries for all using (auth.uid() is not null);
create policy "founder access" on teams for all using (auth.uid() is not null);
create policy "founder access" on prospects for all using (auth.uid() is not null);
create policy "founder access" on templates for all using (auth.uid() is not null);
create policy "founder access" on sent_emails for all using (auth.uid() is not null);
create policy "founder access" on content_ideas for all using (auth.uid() is not null);
create policy "founder access" on assets for all using (auth.uid() is not null);
create policy "founder access" on calendar_events for all using (auth.uid() is not null);

create or replace function sync_demo_to_calendar() returns trigger as $$
declare
  v_company_id uuid;
begin
  select company_id into v_company_id from teams where id = NEW.team_id;

  if NEW.demo_at is not null and NEW.status = 'demo_booked' then
    delete from calendar_events where source_kind = 'demo' and source_id = NEW.id;
    insert into calendar_events (source_kind, source_id, company_id, title, description, starts_at)
    values ('demo', NEW.id, v_company_id, 'Demo · ' || NEW.name, NEW.notes, NEW.demo_at);
  elsif TG_OP = 'UPDATE' and (OLD.status = 'demo_booked' or OLD.demo_at is not null)
    and (NEW.status is distinct from 'demo_booked' or NEW.demo_at is null) then
    delete from calendar_events where source_kind = 'demo' and source_id = NEW.id;
  end if;

  return NEW;
end;
$$ language plpgsql;

create trigger prospects_demo_to_calendar
after insert or update on prospects
for each row execute function sync_demo_to_calendar();

-- Storage bucket (run in dashboard if this fails)
insert into storage.buckets (id, name, public)
values ('assets', 'assets', false)
on conflict (id) do nothing;

create policy "authenticated read assets"
on storage.objects for select
to authenticated
using (bucket_id = 'assets');

create policy "authenticated upload assets"
on storage.objects for insert
to authenticated
with check (bucket_id = 'assets');
