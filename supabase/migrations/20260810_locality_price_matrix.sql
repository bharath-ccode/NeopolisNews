-- Replaces the old quarter x segment price_trends concept (unused after
-- this migration, left in place rather than dropped) with a price matrix
-- keyed on the three things that actually decide price: Locality, Tier,
-- and Construction Stage. One row per combination; admin adds/edits/deletes
-- combinations as needed — this is not a forced full grid.
--
-- Pre-Launch is deliberately excluded from the stage list: quoting a price
-- before RERA registration isn't legal, so it's not a priceable stage here
-- (it remains valid on projects.lifecycle_status for construction tracking).
--
-- Run in the Supabase SQL editor.

create table if not exists public.locality_price_trends (
  id               uuid        primary key default gen_random_uuid(),
  locality         text        not null,
  tier             text        not null,
  lifecycle_status text        not null,
  price            numeric     not null,   -- ₹ per sq ft
  updated_at       timestamptz not null default now(),
  unique (locality, tier, lifecycle_status),
  check (price > 0),
  check (locality in (
    'Neopolis', 'Kokapet', 'Gandipet', 'Financial District', 'Rajendranagar',
    'Nanakramguda', 'Nallagandla', 'Tellapur', 'Puppalaguda', 'Narsingi', 'Gachibowli'
  )),
  check (tier in ('affordable', 'premium', 'luxury', 'uber_luxury')),
  check (lifecycle_status in (
    'rera_registered', 'under_construction', 'structure_complete',
    'finishing', 'oc_received', 'ready_to_move'
  ))
);

create index if not exists locality_price_trends_locality_idx
  on public.locality_price_trends (locality);

alter table public.locality_price_trends enable row level security;

do $$ begin
  if not exists (
    select 1 from pg_policies
    where tablename = 'locality_price_trends' and policyname = 'public_read_locality_price_trends'
  ) then
    create policy "public_read_locality_price_trends"
      on public.locality_price_trends for select using (true);
  end if;
end $$;
