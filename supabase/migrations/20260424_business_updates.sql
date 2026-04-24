create table public.business_updates (
  id          uuid primary key default gen_random_uuid(),
  business_id text not null references public.businesses(id) on delete cascade,
  type        text not null default 'notice',
  title       text not null,
  body        text not null,
  image_url   text null,
  cta_label   text null,
  cta_url     text null,
  status      text not null default 'active',
  created_at  timestamptz not null default now(),
  check (type in ('opening', 'new_arrival', 'hiring', 'notice', 'community'))
);

alter table public.business_updates enable row level security;

create policy "public can read active business updates"
  on public.business_updates for select
  using (status = 'active');
