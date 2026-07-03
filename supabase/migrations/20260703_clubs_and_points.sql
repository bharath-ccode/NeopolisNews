-- Clubs & Points: curated community clubs that host events, reward
-- participation, and log civic impact.
--
--   user_points_ledger        — append-only points history (earn/redeem/adjust)
--   clubs                     — curated club directory (proposed → admin-approved)
--   club_members              — memberships (lead | member)
--   club_events               — club-hosted events with member fee waivers
--   club_event_registrations  — sign-ups, payment state, attendance
--   club_impact_entries       — civic impact log (saplings planted, cleanups…)
--
-- Run in Supabase SQL editor. Safe to re-run (uses IF NOT EXISTS / DO blocks).

-- ── Points ledger ────────────────────────────────────────────────────────────

create table if not exists public.user_points_ledger (
  id          uuid        primary key default gen_random_uuid(),
  user_id     uuid        not null references auth.users(id) on delete cascade,
  points      int         not null,             -- positive = earn, negative = redeem
  kind        text        not null default 'earn', -- earn | redeem | adjust
  source_type text,                             -- e.g. 'club_event_attendance'
  source_id   text,                             -- e.g. the event id
  description text        not null,
  created_at  timestamptz not null default now(),
  check (kind in ('earn', 'redeem', 'adjust'))
);

-- One ledger entry per user per source → awards are idempotent
create unique index if not exists user_points_ledger_source_uniq
  on public.user_points_ledger (user_id, source_type, source_id)
  where source_type is not null and source_id is not null;

create index if not exists user_points_ledger_user_idx
  on public.user_points_ledger (user_id, created_at desc);

-- ── Clubs ────────────────────────────────────────────────────────────────────

create table if not exists public.clubs (
  id            uuid        primary key default gen_random_uuid(),
  name          text        not null,
  category      text        not null, -- sports_fitness | civic_green | hobbies_culture | kids_family
  emoji         text        not null default '🌟',
  description   text        not null,
  announcement  text,                 -- pinned note from the lead
  lead_user_id  uuid        references auth.users(id) on delete set null,
  lead_name     text        not null, -- lead's screen name
  status        text        not null default 'pending', -- pending | active | rejected | archived
  member_count  int         not null default 0,
  admin_note    text,
  created_at    timestamptz not null default now(),
  approved_at   timestamptz,
  check (category in ('sports_fitness', 'civic_green', 'hobbies_culture', 'kids_family')),
  check (status in ('pending', 'active', 'rejected', 'archived'))
);

create index if not exists clubs_status_category_idx on public.clubs (status, category);

create table if not exists public.club_members (
  id          uuid        primary key default gen_random_uuid(),
  club_id     uuid        not null references public.clubs(id) on delete cascade,
  user_id     uuid        not null references auth.users(id) on delete cascade,
  member_name text        not null, -- screen name
  role        text        not null default 'member', -- lead | member
  joined_at   timestamptz not null default now(),
  unique (club_id, user_id),
  check (role in ('lead', 'member'))
);

create index if not exists club_members_club_idx on public.club_members (club_id, joined_at);
create index if not exists club_members_user_idx on public.club_members (user_id);

-- ── Club events ──────────────────────────────────────────────────────────────

create table if not exists public.club_events (
  id               uuid        primary key default gen_random_uuid(),
  club_id          uuid        not null references public.clubs(id) on delete cascade,
  title            text        not null,
  description      text,
  venue            text,
  event_date       date        not null,
  start_time       text,                          -- e.g. "6:30 AM"
  fee_inr          int         not null default 0, -- non-member fee
  member_fee_inr   int         not null default 0, -- member fee (0 = waived)
  max_participants int,
  points_award     int         not null default 20, -- points for attending
  status           text        not null default 'upcoming', -- upcoming | completed | cancelled
  created_at       timestamptz not null default now(),
  check (fee_inr >= 0),
  check (member_fee_inr >= 0),
  check (points_award between 0 and 500),
  check (status in ('upcoming', 'completed', 'cancelled'))
);

create index if not exists club_events_club_idx on public.club_events (club_id, event_date desc);

create table if not exists public.club_event_registrations (
  id                  uuid        primary key default gen_random_uuid(),
  event_id            uuid        not null references public.club_events(id) on delete cascade,
  club_id             uuid        not null references public.clubs(id) on delete cascade,
  user_id             uuid        not null references auth.users(id) on delete cascade,
  participant_name    text        not null, -- screen name
  is_member           boolean     not null default false, -- membership at registration time
  amount_inr          int         not null default 0,
  payment_status      text        not null default 'free', -- free | pending | paid
  razorpay_order_id   text,
  razorpay_payment_id text,
  attended            boolean     not null default false,
  attended_at         timestamptz,
  created_at          timestamptz not null default now(),
  unique (event_id, user_id),
  check (payment_status in ('free', 'pending', 'paid'))
);

create index if not exists club_event_regs_event_idx on public.club_event_registrations (event_id);
create index if not exists club_event_regs_user_idx  on public.club_event_registrations (user_id, created_at desc);

-- ── Civic impact log ─────────────────────────────────────────────────────────

create table if not exists public.club_impact_entries (
  id          uuid        primary key default gen_random_uuid(),
  club_id     uuid        not null references public.clubs(id) on delete cascade,
  title       text        not null,   -- "Plantation drive at Central Park"
  detail      text,
  stat_label  text,                   -- "Saplings planted"
  stat_value  text,                   -- "300"
  entry_date  date        not null default current_date,
  created_at  timestamptz not null default now()
);

create index if not exists club_impact_club_idx on public.club_impact_entries (club_id, entry_date desc);

-- ── RLS (all reads/writes go through API routes with the service-role client) ─

alter table public.user_points_ledger       enable row level security;
alter table public.clubs                    enable row level security;
alter table public.club_members             enable row level security;
alter table public.club_events              enable row level security;
alter table public.club_event_registrations enable row level security;
alter table public.club_impact_entries      enable row level security;

do $$ begin
  if not exists (select 1 from pg_policies where tablename = 'user_points_ledger' and policyname = 'own_read_points') then
    create policy "own_read_points" on public.user_points_ledger for select using (auth.uid() = user_id); end if;
  if not exists (select 1 from pg_policies where tablename = 'clubs' and policyname = 'public_read_active_clubs') then
    create policy "public_read_active_clubs" on public.clubs for select using (status = 'active'); end if;
  if not exists (select 1 from pg_policies where tablename = 'club_members' and policyname = 'public_read_club_members') then
    create policy "public_read_club_members" on public.club_members for select using (true); end if;
  if not exists (select 1 from pg_policies where tablename = 'club_events' and policyname = 'public_read_club_events') then
    create policy "public_read_club_events" on public.club_events for select using (true); end if;
  if not exists (select 1 from pg_policies where tablename = 'club_impact_entries' and policyname = 'public_read_club_impact') then
    create policy "public_read_club_impact" on public.club_impact_entries for select using (true); end if;
  if not exists (select 1 from pg_policies where tablename = 'club_event_registrations' and policyname = 'own_read_club_regs') then
    create policy "own_read_club_regs" on public.club_event_registrations for select using (auth.uid() = user_id); end if;
end $$;
