-- Align public.projects with every column the app writes on create/update
-- (lib/projectsStore.ts). Several project features (lifecycle status,
-- brochure import, banner image, amenities checklist, featured flag,
-- expected completion date) shipped without a checked-in migration, so a
-- live table created before those features is missing columns — and any
-- missing column makes the whole insert fail with a PostgREST 400.
--
-- Every statement is idempotent (add column if not exists) — safe to run
-- regardless of which columns already exist. Run in the Supabase SQL editor.

alter table public.projects add column if not exists builder_id            uuid references public.builders(id);
alter table public.projects add column if not exists total_land_area_acres numeric;
alter table public.projects add column if not exists total_units           integer;
alter table public.projects add column if not exists core_neopolis         boolean not null default false;
alter table public.projects add column if not exists featured              boolean not null default false;
alter table public.projects add column if not exists project_logo_url      text;
alter table public.projects add column if not exists banner_image_url      text;
alter table public.projects add column if not exists project_plan_url      text;
alter table public.projects add column if not exists brochure_url          text;
alter table public.projects add column if not exists project_type          text;
alter table public.projects add column if not exists tier                  text;
alter table public.projects add column if not exists lifecycle_status      text;
-- Stored as "YYYY-MM" (month granularity) — the app formats it client-side.
alter table public.projects add column if not exists expected_completion_date text;
alter table public.projects add column if not exists price_range_min       numeric;
alter table public.projects add column if not exists price_range_max       numeric;
alter table public.projects add column if not exists amenities             text[] not null default '{}';
alter table public.projects add column if not exists created_by            uuid;

-- If expected_completion_date was ever created as a `date` column, the app's
-- "YYYY-MM" writes will be rejected. Convert it to text to match the app.
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'projects'
      and column_name = 'expected_completion_date' and data_type = 'date'
  ) then
    alter table public.projects
      alter column expected_completion_date type text
      using to_char(expected_completion_date, 'YYYY-MM');
  end if;
end $$;
