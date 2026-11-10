-- Per-project price sheet history. Developers re-issue a price sheet as a
-- project moves through phases (pre-launch -> under construction -> ready),
-- and prices change each time — this keeps every snapshot rather than
-- overwriting projects.price_range_min/max in place, so the project's
-- price trajectory survives for later per-project/locality/tier trend
-- analysis (a separate, future feature — this just captures the data).
--
-- "charges" is deliberately a flexible jsonb blob, not fixed columns: real
-- price sheets vary a lot in what they list (floor rise, facing premium,
-- view premium, club/amenities, car parking, legal & documentation, corpus
-- fund, maintenance, ...) — base_price_per_sft is the one number every
-- sheet has and the one that actually drives trend charting.
--
-- No RLS: matches public.projects and its nested tables (towers,
-- unit_plans, ...), which also have none — ProjectForm (shared by
-- /admin/projects and /builder/projects/[id]/edit) writes directly from
-- the browser via the anon client, not through a service-role API route.
-- Run in the Supabase SQL editor.

create table if not exists public.project_price_history (
  id                   uuid        primary key default gen_random_uuid(),
  project_id           uuid        not null references public.projects(id) on delete cascade,
  base_price_per_sft   numeric     not null,
  lifecycle_status     text,
  charges              jsonb       not null default '{}',
  price_sheet_url      text,
  source               text        not null default 'manual' check (source in ('manual', 'price_sheet_import')),
  recorded_at          date        not null default current_date,
  created_at           timestamptz not null default now()
);

create index if not exists project_price_history_project_idx
  on public.project_price_history (project_id, recorded_at desc);
