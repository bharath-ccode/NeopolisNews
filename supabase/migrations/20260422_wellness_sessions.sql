-- wellness_sessions: live online sessions created by trainers
create table if not exists wellness_sessions (
  id              uuid primary key default gen_random_uuid(),
  business_id     text not null references businesses(id) on delete cascade,
  trainer_name    text not null,
  session_type    text not null,
  language        text not null default 'English',
  description     text,
  price_inr       integer not null,
  max_seats       integer not null default 20,
  seats_taken     integer not null default 0,
  meeting_link    text,           -- never exposed in public queries
  platform        text not null default 'other',
  platform_label  text not null default 'Other',
  start_date      date not null,
  end_date        date not null,
  status          text not null default 'draft',  -- draft | live | ended | cancelled
  created_at      timestamptz not null default now(),
  check (end_date >= start_date + interval '7 days'),
  check (end_date <= start_date + interval '90 days'),
  check (price_inr >= 0),
  check (max_seats >= 1),
  check (seats_taken >= 0),
  check (status in ('draft', 'live', 'ended', 'cancelled'))
);

alter table wellness_sessions enable row level security;

-- anyone can read live sessions (meeting_link excluded in API queries)
create policy "Public read live wellness_sessions"
  on wellness_sessions for select using (status = 'live');

-- service role handles all writes via admin client

-- session_enrollments: one row per customer per session
create table if not exists session_enrollments (
  id                  uuid primary key default gen_random_uuid(),
  session_id          uuid not null references wellness_sessions(id) on delete cascade,
  user_id             uuid not null references auth.users(id) on delete cascade,
  razorpay_order_id   text,
  razorpay_payment_id text,
  payment_status      text not null default 'pending',  -- pending | paid | failed
  amount_inr          integer not null,
  enrolled_at         timestamptz not null default now(),
  paid_at             timestamptz,
  unique(session_id, user_id),
  check (payment_status in ('pending', 'paid', 'failed'))
);

alter table session_enrollments enable row level security;

-- users can read their own enrollments
create policy "Users read own enrollments"
  on session_enrollments for select
  using (auth.uid() = user_id);

-- service role handles all writes
