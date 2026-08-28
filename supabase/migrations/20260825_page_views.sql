-- Real page-view tracking, replacing the simulated numbers on
-- /admin/analytics. One row per page load; visitor_id is an anonymous,
-- cookie-based identifier (not tied to an account) used only to estimate
-- unique visitors and rough session length. Run in the Supabase SQL editor.

create table if not exists public.page_views (
  id         bigint      generated always as identity primary key,
  path       text        not null,
  visitor_id text        not null,
  referrer   text,
  created_at timestamptz not null default now()
);

create index if not exists page_views_created_idx on public.page_views (created_at desc);
create index if not exists page_views_path_idx    on public.page_views (path);
create index if not exists page_views_visitor_idx on public.page_views (visitor_id);

alter table public.page_views enable row level security;
-- No public policy -- inserts go through /api/track-pageview using the
-- service-role client; reads are admin-only (also service-role), via
-- /api/admin/analytics/page-views.
