-- Citizen reports: user-submitted local news, moderated by admin.
-- On approval the report is published into public.articles (category 'community').
-- Run in Supabase SQL editor. Safe to re-run (uses IF NOT EXISTS / DO blocks).

create table if not exists public.citizen_reports (
  id          uuid        primary key default gen_random_uuid(),
  user_id     uuid        references auth.users(id) on delete set null,
  author_name text        not null,               -- reporter's screen name
  title       text        not null,
  body        text        not null,
  area        text,                               -- free-text locality, e.g. "Sector 2" / "Near ORR exit"
  image_url   text,
  status      text        not null default 'pending', -- pending | approved | rejected
  admin_note  text,                               -- shown to the reporter on rejection
  article_id  uuid        references public.articles(id) on delete set null, -- set when published
  created_at  timestamptz not null default now(),
  reviewed_at timestamptz,
  check (status in ('pending', 'approved', 'rejected'))
);

-- Indexes
create index if not exists citizen_reports_status_idx
  on public.citizen_reports (status, created_at desc);
create index if not exists citizen_reports_user_idx
  on public.citizen_reports (user_id, created_at desc);

-- RLS (all reads/writes go through API routes with the service-role client)
alter table public.citizen_reports enable row level security;

do $$ begin
  if not exists (select 1 from pg_policies where tablename = 'citizen_reports' and policyname = 'own_read_citizen_reports') then
    create policy "own_read_citizen_reports" on public.citizen_reports for select using (auth.uid() = user_id); end if;
end $$;
