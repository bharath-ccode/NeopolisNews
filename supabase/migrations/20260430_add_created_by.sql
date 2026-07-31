-- Add created_by (FK → auth.users) to key content tables.
-- Nullable so existing rows are not affected; set null on user deletion.

alter table public.articles
  add column if not exists created_by uuid references auth.users(id) on delete set null;

-- businesses: created by admin (admin-created path) or anonymous (self-register path)
alter table public.businesses
  add column if not exists created_by uuid references auth.users(id) on delete set null;

alter table public.projects
  add column if not exists created_by uuid references auth.users(id) on delete set null;

alter table public.business_events
  add column if not exists created_by uuid references auth.users(id) on delete set null;

alter table public.business_offers
  add column if not exists created_by uuid references auth.users(id) on delete set null;

alter table public.business_updates
  add column if not exists created_by uuid references auth.users(id) on delete set null;

alter table public.business_news_submissions
  add column if not exists created_by uuid references auth.users(id) on delete set null;

alter table public.now_showing
  add column if not exists created_by uuid references auth.users(id) on delete set null;

-- Indexes to support "show me everything created by user X" queries
create index if not exists articles_created_by_idx               on public.articles               (created_by);
create index if not exists businesses_created_by_idx             on public.businesses             (created_by);
create index if not exists projects_created_by_idx               on public.projects               (created_by);
create index if not exists business_events_created_by_idx        on public.business_events        (created_by);
create index if not exists business_offers_created_by_idx        on public.business_offers        (created_by);
create index if not exists business_updates_created_by_idx       on public.business_updates       (created_by);
create index if not exists business_news_submissions_created_by_idx on public.business_news_submissions (created_by);
create index if not exists now_showing_created_by_idx            on public.now_showing            (created_by);
