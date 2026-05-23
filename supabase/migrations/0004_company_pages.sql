-- Generated HTML prototypes per company (website, product mock, deck, pitch)

create table if not exists company_pages (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references companies on delete cascade not null,
  kind text not null check (kind in ('website', 'product', 'deck', 'pitch', 'portal')),
  html text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (company_id, kind)
);

alter table company_pages enable row level security;
create policy "founder access" on company_pages for all using (auth.uid() is not null);
