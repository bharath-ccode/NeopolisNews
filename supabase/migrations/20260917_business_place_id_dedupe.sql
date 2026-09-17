-- Shared dedupe key between the two business-onboarding channels. Google
-- Places discovery already keys candidates on place_id so re-running
-- discovery never creates a second candidate for the same physical place —
-- but that place_id was never carried onto the businesses row itself, so a
-- business sourced via discovery and the same business registering
-- directly (self-register or admin-created) could end up as two separate
-- rows for one real clinic. From here on, both channels resolve and store
-- the same Google place_id, and registration checks it before inserting.
-- Run in the Supabase SQL editor.

alter table public.businesses add column if not exists place_id text;

create unique index if not exists businesses_place_id_key
  on public.businesses (place_id) where place_id is not null;
