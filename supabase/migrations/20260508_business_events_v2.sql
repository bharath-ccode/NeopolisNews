-- Multi-day support, ticketing, and slot management for business_events
alter table public.business_events
  add column if not exists end_date        date             null,
  add column if not exists is_free         boolean          not null default true,
  add column if not exists ticket_price    numeric(10,2)    null,
  add column if not exists total_slots     integer          null,
  add column if not exists claimed_slots   integer          not null default 0;

-- Atomic slot claim function — returns the updated row or nothing if sold out
create or replace function claim_event_slot(event_id uuid)
returns setof business_events
language sql
as $$
  update business_events
  set claimed_slots = claimed_slots + 1
  where id = event_id
    and (total_slots is null or claimed_slots < total_slots)
  returning *;
$$;
