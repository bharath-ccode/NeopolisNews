-- Express Interest form on /real-estate: captures prospective buyers who
-- are actively in the market, before any specific project exists for them
-- to enquire about. Deliberately its own table (not business_enquiries or
-- the generic LeadForm->/api/leads path) since the fields are structured
-- buyer-intent data (property type, bedrooms, up to 3 areas, one or more
-- price tiers) rather than a free-text message.
-- Run in the Supabase SQL editor.

create table if not exists public.buyer_interests (
  id            uuid        primary key default gen_random_uuid(),
  name          text        not null,
  phone         text        not null,
  email         text,
  property_type text        not null check (property_type in ('apartment', 'villa')),
  bedrooms      smallint    not null check (bedrooms between 1 and 10),
  areas         text[]      not null,
  tiers         text[]      not null default '{}',
  created_at    timestamptz not null default now()
);

create index if not exists buyer_interests_created_at_idx
  on public.buyer_interests (created_at desc);

-- All reads/writes go through API routes with the service-role client
alter table public.buyer_interests enable row level security;
