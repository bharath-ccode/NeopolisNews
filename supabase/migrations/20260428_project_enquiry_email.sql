-- Add sender_email to project_enquiries.
-- Safe to re-run.

alter table public.project_enquiries
  add column if not exists sender_email text;
