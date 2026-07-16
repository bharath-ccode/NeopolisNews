-- Add an "editorial" article category (Editor's Desk opinion/analysis pieces).
-- Widens the articles.category CHECK constraint. Run in the Supabase SQL editor.

alter table public.articles
  drop constraint if exists articles_category_check;

alter table public.articles
  add constraint articles_category_check
  check (category in ('construction','launches','infrastructure','community','editorial'));
