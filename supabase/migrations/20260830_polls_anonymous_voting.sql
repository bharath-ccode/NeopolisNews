-- 1. Polls no longer require sign-in to vote. Signed-in votes still go
--    through poll_votes (one per user, changeable). Anonymous votes have no
--    stable identity to key a unique constraint on, so they're tallied as a
--    plain counter instead — same "decorative, not individually verified"
--    treatment already used for cartoon view/share counts.
-- 2. seed_votes (added in 20260827) becomes an admin-set input at poll
--    creation time going forward, instead of a one-off SQL backfill.
-- 3. One-off: seed the current latest poll to a ~560 total with option 1
--    favoured by a huge margin.
-- Run in the Supabase SQL editor.

alter table public.poll_options add column if not exists anon_votes integer not null default 0;

create or replace function public.increment_poll_option_votes(p_option_id uuid)
returns void as $$
  update public.poll_options set anon_votes = anon_votes + 1 where id = p_option_id;
$$ language sql;

with latest_poll as (
  select id from public.polls order by publish_date desc, created_at desc limit 1
),
ranked as (
  select
    po.id,
    row_number() over (order by po.position, po.created_at) as rn,
    count(*) over () as n
  from public.poll_options po
  where po.poll_id = (select id from latest_poll)
)
update public.poll_options po
set seed_votes = case
  when ranked.rn = 1 then round(560 * 0.85)::int
  else floor((560 - round(560 * 0.85)::int) / greatest(ranked.n - 1, 1))::int
end
from ranked
where po.id = ranked.id;
