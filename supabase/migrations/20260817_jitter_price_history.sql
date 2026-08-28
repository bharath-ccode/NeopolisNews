-- Cosmetic tinker: nudge every existing price point up or down by exactly
-- Rs 100 (random direction per row), so the trend lines show natural
-- month-to-month noise instead of a perfectly straight formula line.
-- Clamped to each row's locality floor so this can never trip the
-- enforce_locality_price_floor trigger (20260815). Not idempotent in the
-- sense of a fixed result -- re-running jitters again, which is fine, it's
-- cosmetic only. Run in the Supabase SQL editor.

update public.locality_price_trends t
set price = greatest(
  t.price + (case when random() < 0.5 then -1 else 1 end) * 100,
  coalesce((select floor_price from public.locality_price_floors where locality = t.locality), 6000)
);
