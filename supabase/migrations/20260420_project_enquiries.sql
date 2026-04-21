create table if not exists public.project_enquiries (
  id           uuid primary key default gen_random_uuid(),
  project_id   uuid not null references public.projects(id) on delete cascade,
  sender_name  text not null,
  sender_phone text not null,
  message      text not null,
  is_read      boolean not null default false,
  created_at   timestamptz not null default now()
);

create index if not exists project_enquiries_project_id_idx on public.project_enquiries (project_id);
