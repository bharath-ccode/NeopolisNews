-- BMS (BookMyShow) metadata for cinema businesses.
-- Nullable; only populated for Entertainment/Cinema listings.
alter table public.businesses
  add column if not exists bms_code text,   -- e.g. "ALUC"
  add column if not exists bms_slug text;   -- e.g. "allu-cinemas-kokapet"

-- Seed the three known cinema businesses.
-- Run after the businesses are already inserted.
update public.businesses set bms_code = 'ALUC', bms_slug = 'allu-cinemas-kokapet'                              where name ilike '%allu cinemas%'   and industry = 'Entertainment';
update public.businesses set bms_code = 'AACN', bms_slug = 'aparna-cinemas-nallagandla'                        where name ilike '%aparna cinemas%'  and industry = 'Entertainment';
update public.businesses set bms_code = 'MRAD', bms_slug = 'miraj-cinemas-anand-mall-and-movies-narsingi'      where name ilike '%miraj cinemas%'   and industry = 'Entertainment';
