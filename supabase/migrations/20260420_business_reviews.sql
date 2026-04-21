create table if not exists public.business_reviews (
  id           uuid primary key default gen_random_uuid(),
  business_id  text not null references public.businesses(id) on delete cascade,
  author_name  text not null,
  rating       smallint not null check (rating between 1 and 5),
  comment      text null,
  created_at   timestamptz not null default now()
);

create index if not exists business_reviews_business_id_idx
  on public.business_reviews (business_id);
