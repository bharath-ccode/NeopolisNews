-- Business Events
create table public.business_events (
  id           uuid primary key default gen_random_uuid(),
  business_id  text not null references public.businesses(id) on delete cascade,
  name         text not null,
  event_date   date not null,
  start_time   time not null,
  end_time     time not null,
  description  text null,
  image_url    text null,
  status       text not null default 'active',
  created_at   timestamptz not null default now()
);
alter table public.business_events enable row level security;
create policy "public can read active business events"
  on public.business_events for select
  using (status = 'active');

-- Business Offers
create table public.business_offers (
  id               uuid primary key default gen_random_uuid(),
  business_id      text not null references public.businesses(id) on delete cascade,
  name             text not null,
  description      text null,
  discount_percent numeric(5,2) null,
  discount_label   text null,
  start_date       date not null,
  end_date         date not null,
  image_url        text null,
  status           text not null default 'active',
  created_at       timestamptz not null default now()
);
alter table public.business_offers enable row level security;
create policy "public can read active business offers"
  on public.business_offers for select
  using (status = 'active');

-- Business News Submissions
create table public.business_news_submissions (
  id                uuid primary key default gen_random_uuid(),
  business_id       text not null references public.businesses(id) on delete cascade,
  headline          text not null,
  what_happened     text not null,
  where_location    text not null,
  go_live_date      date not null,
  image_url         text null,
  submission_status text not null default 'pending',
  article_id        uuid null references public.articles(id) on delete set null,
  created_at        timestamptz not null default now()
);
alter table public.business_news_submissions enable row level security;
