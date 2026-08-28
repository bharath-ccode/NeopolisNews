-- Per-showtime granularity for Now Showing movies, so a "book tickets"
-- click can point at (and be tracked against) an exact time, not just a
-- cinema + date. Recurring daily within the movie's running_from/
-- running_until window rather than one row per calendar date -- entering
-- a distinct row per day of a multi-week run isn't realistic for an owner.
-- Run in the Supabase SQL editor.

create table if not exists public.show_times (
  id         uuid        primary key default gen_random_uuid(),
  movie_id   uuid        not null references public.now_showing(id) on delete cascade,
  time       text        not null,   -- "HH:MM" 24-hour, owner-entered via <input type="time">
  bms_url    text,                   -- optional override; falls back to the movie's own bms_url
  created_at timestamptz not null default now()
);

create index if not exists show_times_movie_idx on public.show_times (movie_id);

alter table public.show_times enable row level security;

do $$ begin
  if not exists (
    select 1 from pg_policies
    where tablename = 'show_times' and policyname = 'public_read_show_times'
  ) then
    create policy "public_read_show_times"
      on public.show_times for select using (true);
  end if;
end $$;
-- Writes go through /api/my-business/now-showing/[id]/show-times using the
-- service-role client -- owner auth enforced there via resolveBusinessAuth.

-- Capture the exact showtime a "book tickets" click was for, alongside the
-- movie/business ticket_click_events already records.
alter table public.ticket_click_events add column if not exists show_time text;
