-- Practitioners: the people who work at a business (doctors at a clinic or
-- hospital, stylists at a salon, trainers at a gym) — descriptive data
-- only, not a login/account. A business with zero rows here just shows no
-- "Our Doctors" section; one with several gets a picker on the appointment
-- request form. Ownership of the business listing itself is unchanged —
-- still one owner_id on businesses, managed the same way regardless of how
-- many practitioners work there.
-- Run in the Supabase SQL editor.

create table if not exists public.practitioners (
  id                   uuid        primary key default gen_random_uuid(),
  business_id          text        not null references public.businesses(id) on delete cascade,
  name                 text        not null,
  title                text,             -- e.g. "Consultant Cardiologist"
  qualifications       text,             -- e.g. "MBBS, MD"
  registration_number  text,
  years_experience     integer,
  consultation_fee     numeric,
  bio                  text,
  position             integer     not null default 0,
  created_at           timestamptz not null default now()
);

create index if not exists practitioners_business_idx
  on public.practitioners (business_id, position);

-- All reads/writes go through API routes with the service-role client
alter table public.practitioners enable row level security;

-- An appointment request can optionally name which practitioner it's for.
-- Null is the common case for a single-doctor clinic; a multi-doctor
-- clinic or hospital shows a picker once it has 2+ practitioners.
alter table public.appointment_requests
  add column if not exists practitioner_id uuid references public.practitioners(id) on delete set null;
