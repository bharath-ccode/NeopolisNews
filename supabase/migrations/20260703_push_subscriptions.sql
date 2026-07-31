-- Web push subscriptions (browser Push API endpoints).
-- Run in Supabase SQL editor. Safe to re-run.

create table if not exists public.push_subscriptions (
  id         uuid        primary key default gen_random_uuid(),
  user_id    uuid        references auth.users(id) on delete cascade, -- null = anonymous subscriber
  endpoint   text        not null unique,
  p256dh     text        not null,
  auth       text        not null,
  topics     text[]      not null default '{}', -- e.g. {deals,news}
  created_at timestamptz not null default now()
);

create index if not exists push_subscriptions_user_idx   on public.push_subscriptions (user_id);
create index if not exists push_subscriptions_topics_idx on public.push_subscriptions using gin (topics);

-- All reads/writes go through API routes with the service-role client
alter table public.push_subscriptions enable row level security;
