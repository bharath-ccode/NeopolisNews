-- Construction-update subscriptions: email alerts when a builder publishes
-- a construction update (article, category 'construction') for a project.
-- Run in Supabase SQL editor. Safe to re-run (uses IF NOT EXISTS / DO blocks).

create table if not exists public.project_subscriptions (
  id                uuid        primary key default gen_random_uuid(),
  project_id        uuid        not null references public.projects(id) on delete cascade,
  email             text        not null,
  user_id           uuid        references auth.users(id) on delete set null,
  is_active         boolean     not null default true,
  unsubscribe_token uuid        not null default gen_random_uuid(),
  created_at        timestamptz not null default now(),
  unique (project_id, email)
);

create index if not exists project_subscriptions_project_idx
  on public.project_subscriptions (project_id) where is_active;
create index if not exists project_subscriptions_token_idx
  on public.project_subscriptions (unsubscribe_token);

-- RLS (all reads/writes go through API routes with the service-role client)
alter table public.project_subscriptions enable row level security;
