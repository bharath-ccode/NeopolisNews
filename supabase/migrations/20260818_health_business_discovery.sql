-- Health business discovery pipeline: a monthly job searches Google Places
-- for clinics/pharmacies/etc. by locality + specialty, stages results here
-- for admin review, and re-surfaces a candidate if a already-approved
-- listing's phone/hours/address changes on a later run. Nothing here is
-- public — only touched via /api/admin/health-discovery/* using the
-- service-role client.
-- Run in the Supabase SQL editor.

create table if not exists public.health_business_candidates (
  id                 uuid        primary key default gen_random_uuid(),
  place_id           text        not null unique,       -- Google Places place ID; the dedupe key
  name               text        not null,
  business_type      text        not null,               -- lib/businessDirectory.ts "Health & Wellness" type, e.g. 'Clinics'
  subtype            text        not null,               -- subtype within that type, e.g. 'Dermatology & Cosmetology'
  locality            text        not null,
  search_query        text        not null,               -- exact query sent to Places, for audit/debug
  address             text,
  phone               text,
  website             text,
  email               text,                                -- best-effort only; Places API does not provide this
  hours_raw           jsonb       not null default '[]'::jsonb, -- Google's regularOpeningHours.weekdayDescriptions
  rating               numeric,
  rating_count         integer,
  lat                 numeric,
  lng                 numeric,
  status               text        not null default 'pending',
  change_summary       text,                                -- set when a re-run finds a changed field on an approved listing
  promoted_business_id text        references public.businesses(id) on delete set null,
  reviewed_at          timestamptz,
  reviewed_by          text,
  first_seen_at        timestamptz not null default now(),
  last_seen_at         timestamptz not null default now(),
  created_at           timestamptz not null default now(),
  check (status in ('pending', 'approved', 'rejected'))
);

create index if not exists health_candidates_status_idx  on public.health_business_candidates (status);
create index if not exists health_candidates_locality_idx on public.health_business_candidates (locality);

alter table public.health_business_candidates enable row level security;
-- No public policy -- admin-only, accessed exclusively via the service-role client.

-- Businesses gained an email column; discovered candidates can carry one
-- through to the live listing when Places (rarely) or a manual edit
-- supplies it. Additive, existing rows unaffected.
alter table public.businesses add column if not exists email text;
