-- Saved property searches with email alerts on new matching listings.
-- Run in Supabase SQL editor. Safe to re-run.

create table if not exists public.saved_searches (
  id                uuid        primary key default gen_random_uuid(),
  user_id           uuid        not null references auth.users(id) on delete cascade,
  email             text        not null,
  sub_category      text,       -- residential | retail | office (null = any)
  listing_type      text,       -- sale | rent (null = any)
  bedrooms          text,       -- e.g. '3' (null = any)
  is_active         boolean     not null default true,
  unsubscribe_token uuid        not null default gen_random_uuid(),
  created_at        timestamptz not null default now()
);

create index if not exists saved_searches_active_idx on public.saved_searches (is_active) where is_active;
create index if not exists saved_searches_user_idx   on public.saved_searches (user_id, created_at desc);

alter table public.saved_searches enable row level security;

do $$ begin
  if not exists (select 1 from pg_policies where tablename = 'saved_searches' and policyname = 'own_read_saved_searches') then
    create policy "own_read_saved_searches" on public.saved_searches for select using (auth.uid() = user_id); end if;
end $$;
