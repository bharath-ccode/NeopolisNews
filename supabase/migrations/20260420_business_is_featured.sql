alter table public.businesses
  add column if not exists is_featured boolean not null default false;

create index if not exists businesses_is_featured_idx on public.businesses (is_featured) where is_featured = true;
