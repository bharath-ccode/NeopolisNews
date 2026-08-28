-- Per-locality price floors, admin-configurable. Replaces the flat
-- Rs 6000 floor (20260814) -- the same rule now applies per locality
-- instead of globally, and lives in a table an admin can edit at
-- /admin/price-trends instead of a hardcoded constant.
--
-- Enforcement is a trigger, not a plain CHECK, because the floor for a
-- row depends on another table's current value. Raising a locality's
-- floor only affects rows written after the change -- it does not
-- retroactively invalidate history already in locality_price_trends.
-- Run in the Supabase SQL editor.

create table if not exists public.locality_price_floors (
  locality    text        primary key,
  floor_price numeric     not null,
  updated_at  timestamptz not null default now(),
  check (floor_price > 0),
  check (locality in (
    'Neopolis', 'Kokapet', 'Gandipet', 'Financial District', 'Rajendranagar',
    'Nanakramguda', 'Nallagandla', 'Tellapur', 'Puppalaguda', 'Narsingi', 'Gachibowli'
  ))
);

alter table public.locality_price_floors enable row level security;

do $$ begin
  if not exists (
    select 1 from pg_policies
    where tablename = 'locality_price_floors' and policyname = 'public_read_locality_price_floors'
  ) then
    create policy "public_read_locality_price_floors"
      on public.locality_price_floors for select using (true);
  end if;
end $$;

-- Starting point: every locality inherits the old flat floor (6000).
-- Adjust per locality from the admin screen afterward.
insert into public.locality_price_floors (locality, floor_price) values
  ('Neopolis', 6000), ('Kokapet', 6000), ('Gandipet', 6000),
  ('Financial District', 6000), ('Rajendranagar', 6000), ('Nanakramguda', 6000),
  ('Nallagandla', 6000), ('Tellapur', 6000), ('Puppalaguda', 6000),
  ('Narsingi', 6000), ('Gachibowli', 6000)
on conflict (locality) do nothing;

-- Drop the flat floor -- superseded by the per-locality trigger below.
alter table public.locality_price_trends
  drop constraint if exists locality_price_trends_price_check;
-- Restore the original "must be positive" guard the flat floor replaced.
alter table public.locality_price_trends
  add constraint locality_price_trends_price_check check (price > 0);

create or replace function public.enforce_locality_price_floor()
returns trigger as $$
declare
  floor_val numeric;
begin
  select floor_price into floor_val
  from public.locality_price_floors
  where locality = new.locality;

  if floor_val is null then
    floor_val := 6000; -- safety net if a locality has no floor row yet
  end if;

  if new.price < floor_val then
    raise exception 'price % is below the floor of % for %', new.price, floor_val, new.locality;
  end if;

  return new;
end;
$$ language plpgsql;

drop trigger if exists locality_price_trends_floor_trigger on public.locality_price_trends;
create trigger locality_price_trends_floor_trigger
  before insert or update of price, locality on public.locality_price_trends
  for each row execute function public.enforce_locality_price_floor();
