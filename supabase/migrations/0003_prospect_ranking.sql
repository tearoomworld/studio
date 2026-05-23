-- Persist AI ranking on prospects for sales pipeline sorting

alter table prospects
  add column if not exists fit_score numeric,
  add column if not exists priority text check (priority is null or priority in ('high', 'medium', 'low')),
  add column if not exists rank_reason text;

create index if not exists prospects_fit_score_idx on prospects (fit_score desc nulls last);
