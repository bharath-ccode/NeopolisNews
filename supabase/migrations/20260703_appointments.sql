-- Appointments: businesses either deep-link to their existing booking system
-- (booking_url) or receive request-a-slot appointment requests, confirmed by
-- phone. Run in Supabase SQL editor. Safe to re-run.

alter table public.businesses
  add column if not exists booking_url text;

create table if not exists public.appointment_requests (
  id             uuid        primary key default gen_random_uuid(),
  business_id    text        not null references public.businesses(id) on delete cascade,
  user_id        uuid        references auth.users(id) on delete set null,
  customer_name  text        not null,
  customer_phone text        not null,
  preferred_date date        not null,
  preferred_slot text        not null default 'morning', -- morning | afternoon | evening
  note           text,
  status         text        not null default 'pending', -- pending | confirmed | completed | cancelled
  created_at     timestamptz not null default now(),
  check (preferred_slot in ('morning', 'afternoon', 'evening')),
  check (status in ('pending', 'confirmed', 'completed', 'cancelled'))
);

create index if not exists appointment_requests_business_idx
  on public.appointment_requests (business_id, created_at desc);

-- All reads/writes go through API routes with the service-role client
alter table public.appointment_requests enable row level security;
