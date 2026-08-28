-- Instruments "book tickets" click-throughs to BookMyShow — the demand-
-- proof metric for the pitch's movie-tickets item (v1.5: instrument
-- clicks before a real ticketing integration/revenue-share). Two click
-- points feed this: the cinema-level date deep-link on
-- /entertainment/cinemas, and per-movie links in a cinema's Now Showing
-- section on its business profile. Anonymous by design — this is an
-- aggregate demand signal, not per-user tracking.
-- Run in the Supabase SQL editor.

create table if not exists public.ticket_click_events (
  id            uuid        primary key default gen_random_uuid(),
  business_id   text        references public.businesses(id) on delete set null,
  business_name text,
  movie_id      uuid        references public.now_showing(id) on delete set null,
  movie_title   text,
  show_date     date,
  bms_url       text        not null,
  source        text        not null,   -- 'cinemas_page' | 'now_showing'
  created_at    timestamptz not null default now(),
  check (source in ('cinemas_page', 'now_showing'))
);

create index if not exists ticket_click_events_created_idx  on public.ticket_click_events (created_at desc);
create index if not exists ticket_click_events_business_idx on public.ticket_click_events (business_id);

alter table public.ticket_click_events enable row level security;
-- No public policy -- inserts go through /api/ticket-clicks using the
-- service-role client; reads are admin-only (also service-role), via
-- /api/admin/analytics/ticket-clicks.
