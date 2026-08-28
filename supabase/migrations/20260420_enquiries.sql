-- Property / classified enquiries
create table if not exists public.enquiries (
  id            uuid primary key default gen_random_uuid(),
  classified_id uuid not null references public.classifieds(id) on delete cascade,
  sender_name   text not null,
  sender_phone  text not null,
  message       text not null,
  is_read       boolean not null default false,
  created_at    timestamptz not null default now()
);

create index if not exists enquiries_classified_id_idx on public.enquiries (classified_id);

-- Business contact enquiries
create table if not exists public.business_enquiries (
  id           uuid primary key default gen_random_uuid(),
  business_id  text not null references public.businesses(id) on delete cascade,
  sender_name  text not null,
  sender_phone text not null,
  message      text not null,
  is_read      boolean not null default false,
  created_at   timestamptz not null default now()
);

create index if not exists business_enquiries_business_id_idx on public.business_enquiries (business_id);
