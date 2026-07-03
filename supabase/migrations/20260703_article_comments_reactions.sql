-- Article comments + reactions (news engagement)
-- Run in Supabase SQL editor. Safe to re-run (uses IF NOT EXISTS / DO blocks).

create table if not exists public.article_comments (
  id          uuid        primary key default gen_random_uuid(),
  article_id  uuid        not null references public.articles(id) on delete cascade,
  user_id     uuid        references auth.users(id) on delete set null,
  author_name text        not null,
  body        text        not null,
  status      text        not null default 'active', -- active | removed
  created_at  timestamptz not null default now(),
  check (status in ('active', 'removed'))
);

create table if not exists public.article_reactions (
  id          uuid        primary key default gen_random_uuid(),
  article_id  uuid        not null references public.articles(id) on delete cascade,
  user_id     uuid        not null references auth.users(id) on delete cascade,
  reaction    text        not null, -- like | love | insightful
  created_at  timestamptz not null default now(),
  unique (article_id, user_id),
  check (reaction in ('like', 'love', 'insightful'))
);

-- Indexes
create index if not exists article_comments_article_idx
  on public.article_comments (article_id, created_at desc) where status = 'active';
create index if not exists article_reactions_article_idx
  on public.article_reactions (article_id);

-- RLS (all writes go through API routes with the service-role client)
alter table public.article_comments  enable row level security;
alter table public.article_reactions enable row level security;

do $$ begin
  if not exists (select 1 from pg_policies where tablename = 'article_comments' and policyname = 'public_read_article_comments') then
    create policy "public_read_article_comments" on public.article_comments for select using (status = 'active'); end if;
  if not exists (select 1 from pg_policies where tablename = 'article_reactions' and policyname = 'public_read_article_reactions') then
    create policy "public_read_article_reactions" on public.article_reactions for select using (true); end if;
end $$;
