-- Corrects a misspelling: "Mokilla" -> "Mokila" (the correct spelling of
-- the locality). 20260819_add_more_localities.sql has been edited in
-- place to use the correct spelling, but if you already ran it with the
-- old spelling before this fix landed, this migration cleans that up —
-- it's also safe to run if you haven't run 20260819 yet (every step is a
-- no-op in that case, and the corrected 20260819 will do the real work).
-- Run in the Supabase SQL editor.

-- Fix any data already written with the old spelling.
update public.projects                  set locality = 'Mokila' where locality = 'Mokilla';
update public.locality_price_trends     set locality = 'Mokila' where locality = 'Mokilla';
update public.locality_price_floors     set locality = 'Mokila' where locality = 'Mokilla';
update public.business_discovery_candidates set locality = 'Mokila' where locality = 'Mokilla';

-- Re-widen the three CHECK constraints with the corrected spelling, same
-- dynamic-lookup approach as 20260819 (safe regardless of whether that
-- migration — or an even older, narrower version of these constraints —
-- is currently in place).
alter table public.projects
  drop constraint if exists projects_locality_check;
alter table public.projects
  add constraint projects_locality_check
  check (locality is null or locality in (
    'Neopolis', 'Kokapet', 'Gandipet', 'Financial District', 'Rajendranagar', 'Nanakramguda',
    'Nallagandla', 'Tellapur', 'Puppalaguda', 'Narsingi', 'Gachibowli',
    'Velimala', 'Kollur', 'Janwada', 'Khanapur', 'Vattinagulapally', 'Mokila'
  ));

do $$
declare
  con record;
begin
  for con in
    select conname from pg_constraint
    where conrelid = 'public.locality_price_trends'::regclass
      and contype = 'c'
      and pg_get_constraintdef(oid) like '%Neopolis%'
  loop
    execute format('alter table public.locality_price_trends drop constraint %I', con.conname);
  end loop;

  for con in
    select conname from pg_constraint
    where conrelid = 'public.locality_price_floors'::regclass
      and contype = 'c'
      and pg_get_constraintdef(oid) like '%Neopolis%'
  loop
    execute format('alter table public.locality_price_floors drop constraint %I', con.conname);
  end loop;
end $$;

alter table public.locality_price_trends
  add constraint locality_price_trends_locality_check
  check (locality in (
    'Neopolis', 'Kokapet', 'Gandipet', 'Financial District', 'Rajendranagar', 'Nanakramguda',
    'Nallagandla', 'Tellapur', 'Puppalaguda', 'Narsingi', 'Gachibowli',
    'Velimala', 'Kollur', 'Janwada', 'Khanapur', 'Vattinagulapally', 'Mokila'
  ));

alter table public.locality_price_floors
  add constraint locality_price_floors_locality_check
  check (locality in (
    'Neopolis', 'Kokapet', 'Gandipet', 'Financial District', 'Rajendranagar', 'Nanakramguda',
    'Nallagandla', 'Tellapur', 'Puppalaguda', 'Narsingi', 'Gachibowli',
    'Velimala', 'Kollur', 'Janwada', 'Khanapur', 'Vattinagulapally', 'Mokila'
  ));

-- Make sure the floor row exists under the correct spelling (covers both
-- "never ran 20260819" and "ran it with the old spelling" cases).
insert into public.locality_price_floors (locality, floor_price) values
  ('Mokila', 6000)
on conflict (locality) do nothing;
