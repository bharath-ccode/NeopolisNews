-- Individual user profiles linked 1:1 to auth.users.
-- Created separately from auth.users so it doesn't conflict with
-- business-owner accounts that share the same auth.users row.

create table if not exists public.user_profiles (
  id          uuid        primary key default gen_random_uuid(),
  user_id     uuid        not null references auth.users(id) on delete cascade,
  name        text        not null default '',
  phone       text,
  avatar_url  text,
  location    text,
  created_at  timestamptz not null default now(),
  constraint user_profiles_user_id_key unique (user_id)
);

alter table public.user_profiles enable row level security;

-- Each user can only read / write their own row.
create policy "user_profiles_select_own"
  on public.user_profiles for select
  using (auth.uid() = user_id);

create policy "user_profiles_insert_own"
  on public.user_profiles for insert
  with check (auth.uid() = user_id);

create policy "user_profiles_update_own"
  on public.user_profiles for update
  using (auth.uid() = user_id);
