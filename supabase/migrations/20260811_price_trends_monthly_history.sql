-- Turn locality_price_trends into a monthly series so price history is
-- kept, not overwritten. Uniqueness moves from (locality, tier, stage) to
-- (locality, tier, stage, period_month) -- saving a price now records that
-- month's snapshot instead of replacing the only value. "Current price"
-- anywhere in the app = the latest period_month per combination.
-- Run in the Supabase SQL editor.

alter table public.locality_price_trends
  add column if not exists period_month date not null default date_trunc('month', now())::date;

alter table public.locality_price_trends
  drop constraint if exists locality_price_trends_locality_tier_lifecycle_status_key;

alter table public.locality_price_trends
  drop constraint if exists locality_price_trends_period_key;

alter table public.locality_price_trends
  add constraint locality_price_trends_period_key
  unique (locality, tier, lifecycle_status, period_month);

alter table public.locality_price_trends
  alter column period_month drop default;

create index if not exists locality_price_trends_period_idx
  on public.locality_price_trends (locality, tier, lifecycle_status, period_month desc);

-- ─── Illustrative seed data, Feb-Jul 2026 ───────────────────────────────────
-- SYNTHETIC placeholder numbers for the investor demo, not real market
-- data -- anchored at a July 2026 price per combination, backed off ~1.2%/
-- month to show a plausible upward trend. Replace with real figures when
-- available; treat any chart built on this range as illustrative until
-- then. August 2026 onward should be entered for real via /admin/price-trends.
with anchors (locality, tier, lifecycle_status, july_price) as (
  values
    ('Neopolis',            'premium', 'under_construction', 8200),
    ('Neopolis',            'premium', 'ready_to_move',      10600),
    ('Neopolis',            'luxury',  'under_construction', 10500),
    ('Neopolis',            'luxury',  'ready_to_move',      12000),
    ('Kokapet',              'premium', 'under_construction',  7800),
    ('Kokapet',              'premium', 'ready_to_move',      9200),
    ('Kokapet',              'luxury',  'under_construction', 8200),
    ('Kokapet',              'luxury',  'ready_to_move',      9400),
    ('Financial District',   'premium', 'under_construction', 9200),
    ('Financial District',   'premium', 'ready_to_move',      10300),
    ('Financial District',   'luxury',  'under_construction', 9900),
    ('Financial District',   'luxury',  'ready_to_move',      11200)
),
months as (
  select generate_series('2026-02-01'::date, '2026-07-01'::date, interval '1 month')::date as period_month
)
insert into public.locality_price_trends (locality, tier, lifecycle_status, price, period_month)
select
  a.locality, a.tier, a.lifecycle_status,
  round(
    (a.july_price / power(
      1.012,
      (date_part('year', '2026-07-01'::date) - date_part('year', m.period_month)) * 12
        + (date_part('month', '2026-07-01'::date) - date_part('month', m.period_month))
    ))::numeric / 50
  ) * 50 as price,
  m.period_month
from anchors a cross join months m
on conflict (locality, tier, lifecycle_status, period_month) do update set price = excluded.price;
