-- Widen the enum-style CHECK constraints on public.projects to match the
-- app's current value sets (lib/projectsStore.ts). The live constraints
-- predate newer values (e.g. project_type gained 'apartments' and
-- 'independent_homes'), so creating a project fails with 23514:
--   new row for relation "projects" violates check constraint
--   "projects_project_type_check"
--
-- Idempotent — safe to re-run. Run in the Supabase SQL editor.

alter table public.projects
  drop constraint if exists projects_project_type_check;
alter table public.projects
  add constraint projects_project_type_check
  check (project_type in ('apartments','independent_homes','residential','mixed_use','commercial'));

alter table public.projects
  drop constraint if exists projects_tier_check;
alter table public.projects
  add constraint projects_tier_check
  check (tier in ('affordable','premium','luxury','uber_luxury'));

alter table public.projects
  drop constraint if exists projects_lifecycle_status_check;
alter table public.projects
  add constraint projects_lifecycle_status_check
  check (lifecycle_status in ('pre_launch','rera_registered','under_construction','structure_complete','finishing','oc_received','ready_to_move'));
