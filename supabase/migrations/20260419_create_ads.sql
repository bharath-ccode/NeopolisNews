-- General classifieds: cars, bikes, furniture, electronics, etc.
-- NOTE: Create a public Supabase Storage bucket named "classifieds" for photo uploads.

create table public.ads (
  id              uuid        primary key default gen_random_uuid(),
  user_id         uuid        null references auth.users(id),
  owner_name      text        not null,
  contact_phone   text        not null,
  category        text        not null,   -- cars | bikes | furniture | electronics | appliances | others
  title           text        not null,
  description     text        not null,
  price           text        null,
  photos          text[]      not null default '{}',
  duration_days   integer     not null default 30,
  expires_at      timestamptz null,       -- set by admin on verify: verified_at + duration_days
  status          text        not null default 'pending',  -- pending | active | rejected
  rejection_note  text        null,
  verified_at     timestamptz null,
  created_at      timestamptz not null default now()
);

alter table public.ads enable row level security;

create policy "active non-expired ads are public"
  on public.ads for select
  using (status = 'active' and (expires_at is null or expires_at > now()));

create policy "users can read own ads"
  on public.ads for select
  using (auth.uid() = user_id);

create policy "anyone can submit ads"
  on public.ads for insert
  with check (true);

create policy "users can update own pending ads"
  on public.ads for update
  using (auth.uid() = user_id and status = 'pending');
