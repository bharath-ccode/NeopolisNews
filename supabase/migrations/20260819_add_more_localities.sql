-- Adds 6 more localities to the picklist: Velimala, Kollur, Janwada,
-- Khanapur, Vattinagulapally, Mokila. Widens the same CHECK constraint
-- in three places (projects, locality_price_trends, locality_price_floors)
-- and gives the new localities the default Rs 6000 price floor, same as
-- every existing locality. Keep this list in sync with
-- lib/projectsStore.ts's LOCALITIES constant. Run in the Supabase SQL editor.

-- projects.locality — already an explicitly-named constraint.
alter table public.projects
  drop constraint if exists projects_locality_check;
alter table public.projects
  add constraint projects_locality_check
  check (locality is null or locality in (
    'Neopolis', 'Kokapet', 'Gandipet', 'Financial District', 'Rajendranagar', 'Nanakramguda',
    'Nallagandla', 'Tellapur', 'Puppalaguda', 'Narsingi', 'Gachibowli',
    'Velimala', 'Kollur', 'Janwada', 'Khanapur', 'Vattinagulapally', 'Mokila'
  ));

-- locality_price_trends.locality and locality_price_floors.locality were
-- declared as unnamed inline checks, so Postgres auto-named them — find
-- and drop by definition (matching on 'Neopolis', unique to the locality
-- list among each table's checks) instead of guessing the generated name.
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

-- New localities inherit the same starting floor every existing locality
-- got — adjust per locality from /admin/price-trends afterward.
insert into public.locality_price_floors (locality, floor_price) values
  ('Velimala', 6000), ('Kollur', 6000), ('Janwada', 6000),
  ('Khanapur', 6000), ('Vattinagulapally', 6000), ('Mokila', 6000)
on conflict (locality) do nothing;
