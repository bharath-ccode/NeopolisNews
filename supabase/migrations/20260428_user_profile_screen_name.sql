-- Add screen_name, age, gender to user_profiles.
-- Run in Supabase SQL editor. Safe to re-run.

alter table public.user_profiles
  add column if not exists screen_name text,
  add column if not exists age         int,
  add column if not exists gender      text;

-- screen_name must be unique across all residents (case-insensitive)
do $$ begin
  if not exists (
    select 1 from pg_indexes
    where tablename = 'user_profiles' and indexname = 'user_profiles_screen_name_unique'
  ) then
    create unique index user_profiles_screen_name_unique
      on public.user_profiles (lower(screen_name))
      where screen_name is not null;
  end if;
end $$;
