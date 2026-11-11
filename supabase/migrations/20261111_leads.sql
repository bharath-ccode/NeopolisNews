-- The generic LeadForm (/api/leads) used across the site — homepage hero,
-- directory registration CTAs, and now the /advertise/* pages — was
-- email-only, no persisted record. This gives it one, so submissions are
-- reviewable in admin rather than living only in an inbox.
-- Run in the Supabase SQL editor.

create table if not exists public.leads (
  id         uuid        primary key default gen_random_uuid(),
  name       text        not null,
  phone      text        not null,
  email      text,
  message    text,
  purpose    text        not null,
  created_at timestamptz not null default now()
);

create index if not exists leads_purpose_idx on public.leads (purpose, created_at desc);
