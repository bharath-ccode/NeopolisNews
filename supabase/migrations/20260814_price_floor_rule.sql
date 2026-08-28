-- Business rule: no price entry, for any locality/tier/stage/month, may go
-- below ₹6,000/sq ft. Applies universally -- not a per-seed adjustment.
-- Run in the Supabase SQL editor.

alter table public.locality_price_trends
  drop constraint if exists locality_price_trends_price_check;

alter table public.locality_price_trends
  add constraint locality_price_trends_price_check
  check (price >= 6000);
