-- Daily cartoon: one panel per day, optional Friday caption contest.
-- Run in Supabase SQL editor. Safe to re-run.

create table if not exists public.daily_cartoons (
  id                     uuid        primary key default gen_random_uuid(),
  title                  text        not null,
  image_url              text        not null,
  caption                text,                    -- null on contest cartoons until a winner is picked
  artist_name            text        not null default 'NeopolisNews',
  publish_date           date        not null unique,
  is_contest             boolean     not null default false,
  winner_user_id         uuid        references auth.users(id) on delete set null,
  winner_name            text,
  winner_caption         text,
  status                 text        not null default 'draft', -- draft | published
  created_at             timestamptz not null default now(),
  check (status in ('draft', 'published'))
);

create index if not exists daily_cartoons_published_idx
  on public.daily_cartoons (publish_date desc) where status = 'published';

-- Contest caption entries: one per user per cartoon
create table if not exists public.cartoon_captions (
  id          uuid        primary key default gen_random_uuid(),
  cartoon_id  uuid        not null references public.daily_cartoons(id) on delete cascade,
  user_id     uuid        not null references auth.users(id) on delete cascade,
  author_name text        not null, -- screen name
  body        text        not null,
  created_at  timestamptz not null default now(),
  unique (cartoon_id, user_id)
);

create index if not exists cartoon_captions_cartoon_idx
  on public.cartoon_captions (cartoon_id, created_at asc);

alter table public.daily_cartoons  enable row level security;
alter table public.cartoon_captions enable row level security;

do $$ begin
  if not exists (select 1 from pg_policies where tablename = 'daily_cartoons' and policyname = 'public_read_published_cartoons') then
    create policy "public_read_published_cartoons" on public.daily_cartoons for select using (status = 'published'); end if;
  if not exists (select 1 from pg_policies where tablename = 'cartoon_captions' and policyname = 'public_read_cartoon_captions') then
    create policy "public_read_cartoon_captions" on public.cartoon_captions for select using (true); end if;
end $$;
