-- Calendar: custom colors, Cal.com sync, prospect links

alter table calendar_events
  add column if not exists color text,
  add column if not exists external_source text,
  add column if not exists external_id text,
  add column if not exists attendee_email text,
  add column if not exists prospect_id uuid references prospects on delete set null;

create unique index if not exists calendar_events_external_unique
  on calendar_events (external_source, external_id)
  where external_id is not null;

create index if not exists calendar_events_attendee_email_idx
  on calendar_events (attendee_email)
  where attendee_email is not null;

-- Avoid duplicate demo rows when Cal.com already synced the same slot
create or replace function sync_demo_to_calendar() returns trigger as $$
declare
  v_company_id uuid;
begin
  select company_id into v_company_id from teams where id = NEW.team_id;

  if NEW.demo_at is not null and NEW.status = 'demo_booked' then
    delete from calendar_events where source_kind = 'demo' and source_id = NEW.id;

    if NEW.contact_email is null or not exists (
      select 1 from calendar_events
      where external_source = 'cal.com'
        and attendee_email = NEW.contact_email
        and starts_at = NEW.demo_at
    ) then
      insert into calendar_events (
        source_kind, source_id, company_id, title, description, starts_at, attendee_email, prospect_id
      )
      values (
        'demo',
        NEW.id,
        v_company_id,
        'Demo · ' || NEW.name,
        NEW.notes,
        NEW.demo_at,
        NEW.contact_email,
        NEW.id
      );
    end if;
  elsif TG_OP = 'UPDATE' and (OLD.status = 'demo_booked' or OLD.demo_at is not null)
    and (NEW.status is distinct from 'demo_booked' or NEW.demo_at is null) then
    delete from calendar_events where source_kind = 'demo' and source_id = NEW.id;
  end if;

  return NEW;
end;
$$ language plpgsql;
