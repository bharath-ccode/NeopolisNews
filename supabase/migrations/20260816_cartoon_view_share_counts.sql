-- Display counters for cartoons: view count and WhatsApp share count.
-- Seeded once with a random value per cartoon (not live-tracked, same
-- treatment as the article view-count seed). Re-running reshuffles the
-- numbers for rows that already have one -- safe to run again.
-- Run in the Supabase SQL editor.

alter table public.daily_cartoons
  add column if not exists view_count integer not null default 0,
  add column if not exists whatsapp_share_count integer not null default 0;

update public.daily_cartoons
set view_count = 1000 + floor(random() * 501)::int;  -- 1000..1500

update public.daily_cartoons
set whatsapp_share_count = 67 + floor(random() * 234)::int;  -- 67..300
