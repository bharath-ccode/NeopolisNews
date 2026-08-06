-- Add a Locality field to projects — the specific neighbourhood a project
-- sits in, since coverage now spans multiple areas, not just the Neopolis
-- SEZ parcel. Picklist, not free text. Run in the Supabase SQL editor.

alter table public.projects add column if not exists locality text;

alter table public.projects
  drop constraint if exists projects_locality_check;

alter table public.projects
  add constraint projects_locality_check
  check (locality is null or locality in (
    'Neopolis', 'Kokapet', 'Gandipet', 'Rajendranagar', 'Nanakramguda',
    'Nallagandla', 'Tellapur', 'Puppalaguda', 'Narsingi', 'Gachbowli'
  ));
