-- Community Forum: forum_posts and forum_replies
-- Run in Supabase SQL editor. Safe to re-run (uses IF NOT EXISTS / DO blocks).

create table if not exists public.forum_posts (
  id          uuid        primary key default gen_random_uuid(),
  user_id     uuid        references auth.users(id) on delete set null,
  author_name text        not null,
  title       text        not null,
  body        text        not null,
  industry    text,
  type        text,
  reply_count int         not null default 0,
  status      text        not null default 'active', -- active | closed | removed
  created_at  timestamptz not null default now()
);

create table if not exists public.forum_replies (
  id          uuid        primary key default gen_random_uuid(),
  post_id     uuid        not null references public.forum_posts(id) on delete cascade,
  user_id     uuid        references auth.users(id) on delete set null,
  author_name text        not null,
  body        text        not null,
  created_at  timestamptz not null default now()
);

-- Indexes
create index if not exists forum_posts_status_created on public.forum_posts (status, created_at desc);
create index if not exists forum_posts_industry       on public.forum_posts (industry) where status = 'active';
create index if not exists forum_replies_post_id      on public.forum_replies (post_id, created_at asc);

-- RLS
alter table public.forum_posts   enable row level security;
alter table public.forum_replies enable row level security;

do $$ begin
  if not exists (select 1 from pg_policies where tablename = 'forum_posts'   and policyname = 'public_read_forum_posts')   then
    create policy "public_read_forum_posts"   on public.forum_posts   for select using (status = 'active'); end if;
  if not exists (select 1 from pg_policies where tablename = 'forum_posts'   and policyname = 'insert_forum_posts')         then
    create policy "insert_forum_posts"        on public.forum_posts   for insert with check (true);          end if;
  if not exists (select 1 from pg_policies where tablename = 'forum_posts'   and policyname = 'admin_update_forum_posts')   then
    create policy "admin_update_forum_posts"  on public.forum_posts   for update using (true);               end if;
  if not exists (select 1 from pg_policies where tablename = 'forum_posts'   and policyname = 'admin_delete_forum_posts')   then
    create policy "admin_delete_forum_posts"  on public.forum_posts   for delete using (true);               end if;
  if not exists (select 1 from pg_policies where tablename = 'forum_replies' and policyname = 'public_read_forum_replies')  then
    create policy "public_read_forum_replies" on public.forum_replies for select using (true);               end if;
  if not exists (select 1 from pg_policies where tablename = 'forum_replies' and policyname = 'insert_forum_replies')       then
    create policy "insert_forum_replies"      on public.forum_replies for insert with check (true);          end if;
  if not exists (select 1 from pg_policies where tablename = 'forum_replies' and policyname = 'admin_delete_replies')       then
    create policy "admin_delete_replies"      on public.forum_replies for delete using (true);               end if;
end $$;
