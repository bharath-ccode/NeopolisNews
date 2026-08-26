-- Coordinates for businesses, so listing pages can show "X km away" from
-- the customer's location (straight-line distance, computed client-side —
-- no per-listing API call). Google Places already returns lat/lng for
-- free at discovery time; business_discovery_candidates has been storing
-- it all along (lat/lng columns), it just never made it into businesses.
-- Backfills every already-promoted business from its candidate row's
-- coordinates — no external API call needed, the data is already here.
-- Run in the Supabase SQL editor.

alter table public.businesses
  add column if not exists latitude double precision,
  add column if not exists longitude double precision;

update public.businesses b
set latitude = c.lat,
    longitude = c.lng
from public.business_discovery_candidates c
where c.promoted_business_id = b.id
  and c.lat is not null
  and c.lng is not null
  and b.latitude is null;
