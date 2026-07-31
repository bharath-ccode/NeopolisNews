-- Saved properties: a user's shortlist of projects / classifieds.
-- item_id is text so it can reference either table's key type.
-- Run in Supabase SQL editor. Safe to re-run (uses IF NOT EXISTS / DO blocks).

create table if not exists public.saved_properties (
  id         uuid        primary key default gen_random_uuid(),
  user_id    uuid        not null references auth.users(id) on delete cascade,
  item_type  text        not null, -- project | classified
  item_id    text        not null,
  created_at timestamptz not null default now(),
  unique (user_id, item_type, item_id),
  check (item_type in ('project', 'classified'))
);

create index if not exists saved_properties_user_idx
  on public.saved_properties (user_id, created_at desc);

-- RLS (all reads/writes go through API routes with the service-role client)
alter table public.saved_properties enable row level security;

do $$ begin
  if not exists (select 1 from pg_policies where tablename = 'saved_properties' and policyname = 'own_read_saved_properties') then
    create policy "own_read_saved_properties" on public.saved_properties for select using (auth.uid() = user_id); end if;
end $$;
