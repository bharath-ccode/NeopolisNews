create table public.classifieds (
  id                     uuid        primary key default gen_random_uuid(),
  user_id                uuid        not null references auth.users(id),
  owner_name             text        not null,
  contact_phone          text        not null,
  contact_preference     text        not null default 'both',

  sub_category           text        not null,   -- residential | retail | office
  listing_type           text        not null,   -- sale | rent

  project_id             uuid        null references public.projects(id),
  project_name           text        null,
  is_standalone          boolean     not null default false,
  standalone_description text        null,

  tower                  text        null,
  floor_number           integer     null,
  unit_number            text        null,

  property_type          text        not null,   -- apartment | villa | office_space | shop | plot
  bedrooms               text        null,
  bathrooms              text        null,
  carpet_area_sqft       integer     null,
  parking                text        null,
  furnished              text        null,       -- unfurnished | semi-furnished | fully-furnished
  available_from         date        null,
  amenities              text[]      not null default '{}',

  price                  text        not null,
  deposit                text        null,
  description            text        null,
  photos                 text[]      not null default '{}',

  owner_consent          boolean     not null default false,
  consent_at             timestamptz null,

  status                 text        not null default 'pending',  -- pending | active | rejected
  rejection_note         text        null,
  verified_at            timestamptz null,

  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);

alter table public.classifieds enable row level security;

create policy "active classifieds are public"
  on public.classifieds for select
  using (status = 'active');

create policy "users can read own classifieds"
  on public.classifieds for select
  using (auth.uid() = user_id);

create policy "users can insert own classifieds"
  on public.classifieds for insert
  with check (auth.uid() = user_id);

create policy "users can update own pending classifieds"
  on public.classifieds for update
  using (auth.uid() = user_id and status = 'pending');
