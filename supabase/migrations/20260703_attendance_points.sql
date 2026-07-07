-- Two-step earn: points are awarded only on verified attendance, never on
-- booking. Club events already track attendance; this adds it to wellness
-- session enrollments. (Appointments reuse status='completed'.)
-- Run in Supabase SQL editor. Safe to re-run.

alter table public.session_enrollments
  add column if not exists attended    boolean     not null default false,
  add column if not exists attended_at timestamptz;
