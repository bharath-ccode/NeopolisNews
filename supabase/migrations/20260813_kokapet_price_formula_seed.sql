-- Formula-driven 2-year price history for Kokapet, same rule as the
-- Neopolis seed (20260812), re-anchored to Kokapet's benchmark.
-- Reference: Uber Luxury, Ready to Move = 13200 (₹/sq ft) -- the figure
-- to be entered live for August 2026 via /admin/price-trends, so it is
-- NOT inserted by this script.
--
-- Formula, all integer arithmetic, floored at 6000 (standing rule --
-- see 20260814_price_floor_rule.sql -- applies to every locality/tier/
-- stage/month, not just this seed):
--   price = greatest(
--     13200
--       - 1000 * tier_step        (0=Uber Luxury,1=Luxury,2=Premium,3=Affordable)
--       - 1000 * stage_step       (0=Ready to Move ... 5=RERA Registered, earliest stage)
--       -  200 * months_before_aug_2026,
--     6000
--   )
--
-- Seeds Aug 2024 - Jul 2026 inclusive (24 months) x 4 tiers x 6 priceable
-- stages = 576 rows. SYNTHETIC placeholder data for the pitch demo, not
-- real market history -- replace with real figures when available.
--
-- Overlaps the earlier illustrative Kokapet seed (20260811) on Premium/
-- Luxury x Under Construction/Ready to Move for Feb-Jul 2026 (24 rows) --
-- this script runs later and will overwrite those months with the
-- formula's values. Say so if you'd rather keep the hand-edited numbers
-- for that range.
--
-- Run in the Supabase SQL editor (after 20260814_price_floor_rule.sql).

with tiers (tier, tier_step) as (
  values
    ('uber_luxury', 0),
    ('luxury',      1),
    ('premium',     2),
    ('affordable',  3)
),
stages (lifecycle_status, stage_step) as (
  values
    ('ready_to_move',      0),
    ('oc_received',        1),
    ('finishing',          2),
    ('structure_complete', 3),
    ('under_construction', 4),
    ('rera_registered',    5)
),
months as (
  select generate_series('2024-08-01'::date, '2026-07-01'::date, interval '1 month')::date as period_month
)
insert into public.locality_price_trends (locality, tier, lifecycle_status, price, period_month)
select
  'Kokapet',
  t.tier,
  s.lifecycle_status,
  greatest(
    13200
      - 1000 * t.tier_step
      - 1000 * s.stage_step
      -  200 * (
           (date_part('year', '2026-08-01'::date) - date_part('year', m.period_month)) * 12
           + (date_part('month', '2026-08-01'::date) - date_part('month', m.period_month))
         ),
    6000
  ),
  m.period_month
from tiers t cross join stages s cross join months m
on conflict (locality, tier, lifecycle_status, period_month) do update set price = excluded.price;
