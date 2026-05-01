-- ── Session slot controls ────────────────────────────────────────────────────
-- Enforce capacity limits per delivery mode:
--   on_location → max 10 seats (studio / gym capacity)
--   online      → max 25 seats (manageable live group)
alter table public.wellness_sessions
  add constraint if not exists sessions_max_seats_by_mode
  check (
    (delivery_mode = 'on_location' and max_seats <= 10) or
    (delivery_mode = 'online'      and max_seats <= 25)
  );

-- ── Approval gate ────────────────────────────────────────────────────────────
-- Only businesses explicitly approved by admin can publish live sessions.
-- Reusable: will also gate events (marathons, concerts) when that feature ships.
alter table public.businesses
  add column if not exists approved_for_sessions boolean not null default false;

-- Auto-approve existing verified Health & Wellness businesses so they aren't
-- blocked by the new gate on deploy.
update public.businesses
  set approved_for_sessions = true
  where verified = true
    and industry = 'Health & Wellness';

-- ── Extend session_enrollments to support free claims (no payment) ────────────
alter table public.session_enrollments
  drop constraint if exists session_enrollments_payment_status_check;

alter table public.session_enrollments
  add constraint session_enrollments_payment_status_check
  check (payment_status in ('pending', 'paid', 'failed', 'claimed'));

-- ── Atomic claim function ────────────────────────────────────────────────────
-- Locks the session row, checks capacity, prevents double-claims.
-- Returns jsonb: { success, message, remaining }
-- Same pattern will be reused for marathon/concert event slots.
create or replace function public.claim_session_slot(
  p_session_id uuid,
  p_user_id    uuid
)
returns jsonb
language plpgsql
security definer
as $$
declare
  v_sess  wellness_sessions%rowtype;
begin
  select * into v_sess
    from wellness_sessions
    where id = p_session_id
    for update;

  if not found then
    return '{"success":false,"message":"Session not found"}'::jsonb;
  end if;
  if v_sess.status <> 'live' then
    return '{"success":false,"message":"Session is not live"}'::jsonb;
  end if;
  if v_sess.seats_taken >= v_sess.max_seats then
    return '{"success":false,"message":"No slots available"}'::jsonb;
  end if;

  -- idempotent: already claimed → return current state
  if exists (
    select 1 from session_enrollments
    where session_id = p_session_id
      and user_id    = p_user_id
      and payment_status = 'claimed'
  ) then
    return jsonb_build_object(
      'success', false,
      'message', 'Already claimed',
      'remaining', v_sess.max_seats - v_sess.seats_taken
    );
  end if;

  insert into session_enrollments (session_id, user_id, amount_inr, payment_status)
  values (p_session_id, p_user_id, v_sess.price_inr, 'claimed');

  update wellness_sessions
    set seats_taken = seats_taken + 1
    where id = p_session_id;

  return jsonb_build_object(
    'success', true,
    'message', 'Slot claimed',
    'remaining', v_sess.max_seats - v_sess.seats_taken - 1
  );
end;
$$;

-- ── Atomic unclaim function ──────────────────────────────────────────────────
create or replace function public.unclaim_session_slot(
  p_session_id uuid,
  p_user_id    uuid
)
returns jsonb
language plpgsql
security definer
as $$
declare
  v_deleted boolean := false;
begin
  delete from session_enrollments
    where session_id       = p_session_id
      and user_id          = p_user_id
      and payment_status   = 'claimed';

  if found then
    update wellness_sessions
      set seats_taken = greatest(0, seats_taken - 1)
      where id = p_session_id;
    v_deleted := true;
  end if;

  return jsonb_build_object('success', v_deleted);
end;
$$;
