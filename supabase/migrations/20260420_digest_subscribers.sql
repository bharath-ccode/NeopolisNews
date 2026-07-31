create table if not exists public.digest_subscribers (
  id            uuid primary key default gen_random_uuid(),
  email         text not null unique,
  name          text null,
  subscribed_at timestamptz not null default now(),
  is_active     boolean not null default true
);
