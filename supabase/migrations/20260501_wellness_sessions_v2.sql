-- Extend wellness_sessions with delivery mode, specific time, and on-location address.
alter table public.wellness_sessions
  add column if not exists delivery_mode text not null default 'online'
    check (delivery_mode in ('online', 'on_location')),
  add column if not exists session_time  time,   -- daily class time, e.g. 07:00:00
  add column if not exists address       text;   -- on_location physical address
