-- Let users favourite businesses (cafes, salons, cinemas, clinics …) with
-- the same saved_properties mechanism used for projects and classifieds.
-- Run in the Supabase SQL editor.

alter table public.saved_properties
  drop constraint if exists saved_properties_item_type_check;

alter table public.saved_properties
  add constraint saved_properties_item_type_check
  check (item_type in ('project', 'classified', 'business'));
