-- Curated quarterly price trends (shown at /real-estate#prices).
-- One row per period x segment. Admin-managed.
-- Run in Supabase SQL editor. Safe to re-run.

create table if not exists public.price_trends (
  id          uuid        primary key default gen_random_uuid(),
  period      text        not null,           -- display label, e.g. "Q1 2026"
  period_date date        not null,           -- first day of the period (for ordering)
  segment     text        not null,           -- residential | office | retail
  price       numeric     not null,           -- residential: ₹/sqft; office/retail: ₹/sqft/month
  note        text,
  created_at  timestamptz not null default now(),
  unique (period, segment),
  check (segment in ('residential', 'office', 'retail')),
  check (price > 0)
);

create index if not exists price_trends_order_idx on public.price_trends (segment, period_date);

alter table public.price_trends enable row level security;

do $$ begin
  if not exists (select 1 from pg_policies where tablename = 'price_trends' and policyname = 'public_read_price_trends') then
    create policy "public_read_price_trends" on public.price_trends for select using (true); end if;
end $$;

-- Seed with the data previously hardcoded on the page (no-op if already present)
insert into public.price_trends (period, period_date, segment, price)
values
  ('Q1 2024', '2024-01-01', 'residential', 7200),  ('Q1 2024', '2024-01-01', 'office',  82), ('Q1 2024', '2024-01-01', 'retail', 110),
  ('Q2 2024', '2024-04-01', 'residential', 7600),  ('Q2 2024', '2024-04-01', 'office',  85), ('Q2 2024', '2024-04-01', 'retail', 118),
  ('Q3 2024', '2024-07-01', 'residential', 7900),  ('Q3 2024', '2024-07-01', 'office',  88), ('Q3 2024', '2024-07-01', 'retail', 122),
  ('Q4 2024', '2024-10-01', 'residential', 8300),  ('Q4 2024', '2024-10-01', 'office',  92), ('Q4 2024', '2024-10-01', 'retail', 130),
  ('Q1 2025', '2025-01-01', 'residential', 8800),  ('Q1 2025', '2025-01-01', 'office',  95), ('Q1 2025', '2025-01-01', 'retail', 138),
  ('Q2 2025', '2025-04-01', 'residential', 9200),  ('Q2 2025', '2025-04-01', 'office',  98), ('Q2 2025', '2025-04-01', 'retail', 145),
  ('Q3 2025', '2025-07-01', 'residential', 9700),  ('Q3 2025', '2025-07-01', 'office', 102), ('Q3 2025', '2025-07-01', 'retail', 150),
  ('Q4 2025', '2025-10-01', 'residential', 10400), ('Q4 2025', '2025-10-01', 'office', 108), ('Q4 2025', '2025-10-01', 'retail', 160)
on conflict (period, segment) do nothing;
