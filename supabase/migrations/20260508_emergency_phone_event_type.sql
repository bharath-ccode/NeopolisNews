-- Add emergency_phone to businesses and event_type to business_events

alter table public.businesses
  add column if not exists emergency_phone text null;

alter table public.business_events
  add column if not exists event_type text not null default 'exhibition'
    check (event_type in ('music_concert','sports_run','food_festival','culture_art','exhibition'));
