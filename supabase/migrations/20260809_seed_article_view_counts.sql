-- One-off seed: randomize article view counts for display.
-- All articles get an odd number in [230, 670]; editorials are then
-- overridden to an odd number in [1001, 2000] (editorials read higher).
-- Not idempotent by design — re-running reshuffles the numbers. Run in the
-- Supabase SQL editor.

update public.articles
set views = 231 + 2 * floor(random() * 220)::int;  -- odd, 231..669

update public.articles
set views = 1001 + 2 * floor(random() * 500)::int  -- odd, 1001..1999
where category = 'editorial';
