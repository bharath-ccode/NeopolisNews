-- Adds Manchirevula to the locality picklist. Widens the same CHECK
-- constraint in three places (projects, locality_price_trends,
-- locality_price_floors) and gives it the default Rs 6000 price floor,
-- same as every existing locality. Keep this list in sync with
-- lib/projectsStore.ts's LOCALITIES constant. Run in the Supabase SQL editor.

alter table public.projects
  drop constraint if exists projects_locality_check;
alter table public.projects
  add constraint projects_locality_check
  check (locality is null or locality in (
    'Neopolis', 'Kokapet', 'Gandipet', 'Financial District', 'Rajendranagar', 'Nanakramguda',
    'Nallagandla', 'Tellapur', 'Puppalaguda', 'Narsingi', 'Gachibowli',
    'Velimala', 'Kollur', 'Janwada', 'Khanapur', 'Vattinagulapally', 'Mokila',
    'Manchirevula'
  ));

-- locality_price_trends.locality and locality_price_floors.locality checks
-- are unnamed/auto-named — find and drop by definition (matching on
-- 'Neopolis', present in every version of this constraint so far) instead
-- of guessing the generated name.
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
    'Velimala', 'Kollur', 'Janwada', 'Khanapur', 'Vattinagulapally', 'Mokila',
    'Manchirevula'
  ));

alter table public.locality_price_floors
  add constraint locality_price_floors_locality_check
  check (locality in (
    'Neopolis', 'Kokapet', 'Gandipet', 'Financial District', 'Rajendranagar', 'Nanakramguda',
    'Nallagandla', 'Tellapur', 'Puppalaguda', 'Narsingi', 'Gachibowli',
    'Velimala', 'Kollur', 'Janwada', 'Khanapur', 'Vattinagulapally', 'Mokila',
    'Manchirevula'
  ));

-- New locality inherits the same starting floor every existing locality
-- got — adjust from /admin/price-trends afterward.
insert into public.locality_price_floors (locality, floor_price) values
  ('Manchirevula', 6000)
on conflict (locality) do nothing;
