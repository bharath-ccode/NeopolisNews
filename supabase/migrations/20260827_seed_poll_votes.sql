-- One-off cosmetic seed for the (currently sole) homepage poll, same idea as
-- the August article-views seed: a `seed_votes` baseline blended into the
-- real tally so the poll doesn't launch showing zero votes. Targets a 300
-- total split ~51% / ~37% / ~12% across a poll's 3 options, ordered by
-- position. Safe to rerun — it resets seed_votes to the same values.
-- Run in the Supabase SQL editor.

alter table public.poll_options add column if not exists seed_votes int not null default 0;

with ranked as (
  select
    po.id,
    row_number() over (partition by po.poll_id order by po.position, po.created_at) as rn,
    count(*) over (partition by po.poll_id) as option_count
  from public.poll_options po
)
update public.poll_options po
set seed_votes = case ranked.rn
  when 1 then 153
  when 2 then 111
  when 3 then 36
  else 0
end
from ranked
where po.id = ranked.id
  and ranked.option_count = 3;
