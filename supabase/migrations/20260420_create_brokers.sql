-- ─── Brokers table ────────────────────────────────────────────────────────────

create table public.brokers (
  id             uuid primary key default gen_random_uuid(),
  auth_user_id   uuid null unique references auth.users(id) on delete cascade,
  name           text not null,
  company_name   text null,
  phone          text not null,
  email          text not null unique,
  rera_number    text null,
  status         text not null default 'pending',   -- pending | approved | rejected
  rejection_note text null,
  approved_at    timestamptz null,
  created_at     timestamptz not null default now()
);

alter table public.brokers enable row level security;

-- Broker can read their own record
create policy "broker can read own record"
  on public.brokers for select
  using (auth_user_id = auth.uid());

-- ─── Add broker_id to classifieds ─────────────────────────────────────────────

alter table public.classifieds
  add column if not exists broker_id uuid null references public.brokers(id) on delete set null;

-- Public can read active broker listings (same policy already exists for user listings)
-- The existing classifieds select policy covers broker listings too.
