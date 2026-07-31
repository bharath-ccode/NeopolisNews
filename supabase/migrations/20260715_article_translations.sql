-- Article translations: cached per-language versions of published articles.
-- Telugu ('te') today; the (article_id, lang) key leaves room for more languages.
-- Run in Supabase SQL editor. Safe to re-run.

create table if not exists public.article_translations (
  id         uuid        primary key default gen_random_uuid(),
  article_id uuid        not null references public.articles(id) on delete cascade,
  lang       text        not null,
  title      text        not null,
  excerpt    text        not null,
  content    text        not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (article_id, lang)
);

drop trigger if exists article_translations_updated_at on public.article_translations;
create trigger article_translations_updated_at
  before update on public.article_translations
  for each row execute function update_updated_at();

alter table public.article_translations enable row level security;

do $$ begin
  if not exists (select 1 from pg_policies where tablename = 'article_translations' and policyname = 'public_read_article_translations') then
    create policy "public_read_article_translations" on public.article_translations for select using (true); end if;
end $$;
