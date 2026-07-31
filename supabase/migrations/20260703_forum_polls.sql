-- Forum polls: optional poll attached to a forum post.
-- Run in Supabase SQL editor. Safe to re-run (uses IF NOT EXISTS / DO blocks).

alter table public.forum_posts
  add column if not exists has_poll boolean not null default false;

create table if not exists public.forum_poll_options (
  id         uuid        primary key default gen_random_uuid(),
  post_id    uuid        not null references public.forum_posts(id) on delete cascade,
  label      text        not null,
  position   int         not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.forum_poll_votes (
  id         uuid        primary key default gen_random_uuid(),
  post_id    uuid        not null references public.forum_posts(id) on delete cascade,
  option_id  uuid        not null references public.forum_poll_options(id) on delete cascade,
  user_id    uuid        not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (post_id, user_id)   -- one vote per user per poll (changeable)
);

-- Indexes
create index if not exists forum_poll_options_post_idx on public.forum_poll_options (post_id, position);
create index if not exists forum_poll_votes_post_idx   on public.forum_poll_votes (post_id);

-- RLS (all writes go through API routes with the service-role client)
alter table public.forum_poll_options enable row level security;
alter table public.forum_poll_votes   enable row level security;

do $$ begin
  if not exists (select 1 from pg_policies where tablename = 'forum_poll_options' and policyname = 'public_read_poll_options') then
    create policy "public_read_poll_options" on public.forum_poll_options for select using (true); end if;
  if not exists (select 1 from pg_policies where tablename = 'forum_poll_votes' and policyname = 'public_read_poll_votes') then
    create policy "public_read_poll_votes" on public.forum_poll_votes for select using (true); end if;
end $$;
