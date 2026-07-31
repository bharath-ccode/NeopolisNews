-- Chapter Coffee — Launch Offer (15% OFF, valid until May 10 2026)
-- Run in Supabase SQL editor. Safe to re-run (inserts only if not already present).

insert into public.business_offers (
  business_id,
  name,
  description,
  discount_percent,
  start_date,
  end_date,
  status
)
select
  id,
  'Launch Offer',
  'Celebrate our grand opening — 15% off on all drinks and bites for Neopolis residents.',
  15,
  '2026-04-27',
  '2026-05-10',
  'active'
from public.businesses
where name ilike '%chapter coffee%'
  and not exists (
    select 1 from public.business_offers bo
    where bo.business_id = businesses.id
      and bo.name = 'Launch Offer'
  )
limit 1;
