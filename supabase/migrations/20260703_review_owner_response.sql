-- Business owners can respond to customer reviews.
-- Run in Supabase SQL editor. Safe to re-run.

alter table public.business_reviews
  add column if not exists owner_response    text,
  add column if not exists owner_response_at timestamptz;
