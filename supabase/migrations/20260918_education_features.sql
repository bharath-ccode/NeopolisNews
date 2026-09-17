-- Education-specific additions, parallel to the Health & Wellness work:
-- 1. Achievements board — a lightweight, owner-managed list of student/
--    school achievements, shown publicly. Distinct from a full News
--    article (which goes through editorial review) — this is for the
--    steady trickle of smaller wins that deserve a spot on the school's
--    own page without needing a full article each time.
-- 2. Structured fee/grade range on businesses — one of parents' top
--    screening criteria, previously only ever buried in free-text
--    description.
-- 3. Structured admissions fields on an enquiry (grade applying for,
--    child's age), instead of only a free-text message.
-- Industry scoping (Education-only UI) lives in the app, not the schema —
-- same pattern as practitioners.
-- Run in the Supabase SQL editor.

create table if not exists public.school_achievements (
  id            uuid        primary key default gen_random_uuid(),
  business_id   text        not null references public.businesses(id) on delete cascade,
  student_name  text,             -- optional — some achievements are school-wide, not one student
  class_grade   text,             -- e.g. "Grade 8"
  title         text        not null,  -- e.g. "State-level Chess Champion"
  category      text,             -- e.g. Academic / Sports / Arts / Co-curricular
  achieved_date date,
  image_url     text,
  position      integer     not null default 0,
  created_at    timestamptz not null default now()
);

create index if not exists school_achievements_business_idx
  on public.school_achievements (business_id, position);

-- All reads/writes go through API routes with the service-role client
alter table public.school_achievements enable row level security;

alter table public.businesses add column if not exists fee_min integer;
alter table public.businesses add column if not exists fee_max integer;
alter table public.businesses add column if not exists grade_from text;
alter table public.businesses add column if not exists grade_to text;

alter table public.business_enquiries add column if not exists grade_applying_for text;
alter table public.business_enquiries add column if not exists child_age integer;
