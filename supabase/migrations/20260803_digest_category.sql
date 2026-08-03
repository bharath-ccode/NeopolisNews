-- Separate the daily AI digests from the local topic taxonomy.
--
-- Local topics (sourced in Neopolis): construction (builders), launches
-- (builders), infrastructure (admin), community (citizen reports, business
-- news). The generated daily digests (International / National / State /
-- Hyderabad) were being filed under 'community' as a filler value, mixing
-- the two taxonomies. They now get their own 'digest' category; their real
-- identity stays in digest_level. Run in the Supabase SQL editor.

alter table public.articles
  drop constraint if exists articles_category_check;

alter table public.articles
  add constraint articles_category_check
  check (category in ('construction','launches','infrastructure','community','editorial','digest'));

-- Re-file existing geographic digests out of 'community'.
update public.articles
  set category = 'digest'
  where digest_level in ('international','national','state','city');
