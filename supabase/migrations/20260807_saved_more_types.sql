-- Extend user favourites to builders, events and deals (on top of
-- projects, classifieds and businesses). Supersedes the check widened in
-- 20260806_saved_businesses.sql — safe to run whether or not that ran.
-- Run in the Supabase SQL editor.

alter table public.saved_properties
  drop constraint if exists saved_properties_item_type_check;

alter table public.saved_properties
  add constraint saved_properties_item_type_check
  check (item_type in ('project', 'classified', 'business', 'builder', 'event', 'deal'));
