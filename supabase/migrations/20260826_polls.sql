-- Homepage Polls: admin-created question with multiple choice options.
-- Mirrors daily_cartoons' shape (one per publish_date, draft/published
-- status, archive) and forum_poll_votes' one-vote-per-user semantics.
-- Run in the Supabase SQL editor.

create table if not exists public.polls (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  publish_date date not null unique,
  status text not null default 'draft',
  created_at timestamptz not null default now(),
  check (status in ('draft', 'published'))
);

create index if not exists polls_published_idx
  on public.polls (publish_date desc)
  where status = 'published';

create table if not exists public.poll_options (
  id uuid primary key default gen_random_uuid(),
  poll_id uuid not null references public.polls(id) on delete cascade,
  label text not null,
  position int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists poll_options_poll_id_idx on public.poll_options (poll_id);

create table if not exists public.poll_votes (
  id uuid primary key default gen_random_uuid(),
  poll_id uuid not null references public.polls(id) on delete cascade,
  option_id uuid not null references public.poll_options(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (poll_id, user_id)
);

create index if not exists poll_votes_poll_id_idx on public.poll_votes (poll_id);

alter table public.polls enable row level security;
alter table public.poll_options enable row level security;
alter table public.poll_votes enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'polls' and policyname = 'public_read_published_polls'
  ) then
    create policy public_read_published_polls on public.polls
      for select using (status = 'published');
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'poll_options' and policyname = 'public_read_poll_options'
  ) then
    create policy public_read_poll_options on public.poll_options
      for select using (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'poll_votes' and policyname = 'public_read_poll_votes'
  ) then
    create policy public_read_poll_votes on public.poll_votes
      for select using (true);
  end if;
end $$;
