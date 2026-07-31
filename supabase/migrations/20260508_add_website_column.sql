-- Add website URL column to businesses
alter table public.businesses
  add column if not exists website text null;
