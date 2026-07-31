-- Site-visit bookings for real-estate projects.
-- Run in Supabase SQL editor. Safe to re-run (uses IF NOT EXISTS / DO blocks).

create table if not exists public.site_visit_bookings (
  id             uuid        primary key default gen_random_uuid(),
  project_id     uuid        not null references public.projects(id) on delete cascade,
  user_id        uuid        references auth.users(id) on delete set null,
  visitor_name   text        not null,
  visitor_phone  text        not null,
  preferred_date date        not null,
  preferred_slot text        not null default 'morning', -- morning | afternoon | evening
  note           text,
  status         text        not null default 'pending', -- pending | confirmed | completed | cancelled
  created_at     timestamptz not null default now(),
  check (preferred_slot in ('morning', 'afternoon', 'evening')),
  check (status in ('pending', 'confirmed', 'completed', 'cancelled'))
);

create index if not exists site_visit_bookings_project_idx
  on public.site_visit_bookings (project_id, created_at desc);

-- RLS (all reads/writes go through API routes with the service-role client)
alter table public.site_visit_bookings enable row level security;
