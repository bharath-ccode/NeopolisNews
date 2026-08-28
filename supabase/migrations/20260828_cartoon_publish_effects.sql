-- What happens at the moment content gets published:
-- 1. daily_cartoons gets an artwork_url column holding the clean,
--    unbaked image (title/caption get composited onto image_url only when
--    published — see app/api/admin/cartoons/route.ts and [id]/route.ts —
--    so a later unpublish/republish cycle re-bakes fresh from artwork_url
--    instead of stacking text on top of a previous bake).
-- 2. daily_cartoons.view_count / whatsapp_share_count and
--    articles.views get auto-seeded with a randomized odd number the
--    moment a row is first published (not on later edits to an
--    already-published row) — neither counter is live-tracked, so this
--    replaces the earlier one-off seed migrations going forward.
-- Run in the Supabase SQL editor.

alter table public.daily_cartoons add column if not exists artwork_url text;
update public.daily_cartoons set artwork_url = image_url where artwork_url is null;

create or replace function public.seed_cartoon_counts()
returns trigger as $$
begin
  if tg_op = 'INSERT' then
    if new.status = 'published' then
      new.view_count := 300 + (2 * floor(random() * 100) + 1)::int;          -- 301..499 odd
      new.whatsapp_share_count := 50 + (2 * floor(random() * 50) + 1)::int;  -- 51..149 odd
    end if;
  elsif tg_op = 'UPDATE' then
    if new.status = 'published' and old.status is distinct from 'published' then
      new.view_count := 300 + (2 * floor(random() * 100) + 1)::int;
      new.whatsapp_share_count := 50 + (2 * floor(random() * 50) + 1)::int;
    end if;
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_seed_cartoon_counts on public.daily_cartoons;
create trigger trg_seed_cartoon_counts
  before insert or update on public.daily_cartoons
  for each row execute function public.seed_cartoon_counts();

create or replace function public.seed_article_views()
returns trigger as $$
begin
  if tg_op = 'INSERT' then
    if new.status = 'published' then
      new.views := 400 + (2 * floor(random() * 100) + 1)::int;  -- 401..599 odd
    end if;
  elsif tg_op = 'UPDATE' then
    if new.status = 'published' and old.status is distinct from 'published' then
      new.views := 400 + (2 * floor(random() * 100) + 1)::int;
    end if;
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_seed_article_views on public.articles;
create trigger trg_seed_article_views
  before insert or update on public.articles
  for each row execute function public.seed_article_views();
