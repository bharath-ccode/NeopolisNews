-- One-off seed: bump view counts for the latest published articles
-- (created this August) above 200 for display purposes. Not idempotent by
-- design -- re-running reshuffles the numbers. Run in the Supabase SQL editor.

update public.articles
set views = 201 + floor(random() * 600)::int  -- 201..800
where status = 'published'
  and created_at >= '2026-08-01'
  and created_at <  '2026-09-01';
