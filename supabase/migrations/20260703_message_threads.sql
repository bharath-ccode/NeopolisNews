-- Buyer <-> seller messaging on classifieds.
-- Run in Supabase SQL editor. Safe to re-run.

create table if not exists public.message_threads (
  id              uuid        primary key default gen_random_uuid(),
  classified_id   uuid        not null references public.classifieds(id) on delete cascade,
  listing_title   text        not null,
  buyer_user_id   uuid        not null references auth.users(id) on delete cascade,
  buyer_name      text        not null,
  seller_user_id  uuid        not null references auth.users(id) on delete cascade,
  seller_name     text        not null,
  last_message_at timestamptz not null default now(),
  created_at      timestamptz not null default now(),
  unique (classified_id, buyer_user_id)
);

create table if not exists public.thread_messages (
  id             uuid        primary key default gen_random_uuid(),
  thread_id      uuid        not null references public.message_threads(id) on delete cascade,
  sender_user_id uuid        not null references auth.users(id) on delete cascade,
  sender_name    text        not null,
  body           text        not null,
  is_read        boolean     not null default false,
  created_at     timestamptz not null default now()
);

create index if not exists message_threads_buyer_idx  on public.message_threads (buyer_user_id, last_message_at desc);
create index if not exists message_threads_seller_idx on public.message_threads (seller_user_id, last_message_at desc);
create index if not exists thread_messages_thread_idx on public.thread_messages (thread_id, created_at asc);

alter table public.message_threads enable row level security;
alter table public.thread_messages enable row level security;

do $$ begin
  if not exists (select 1 from pg_policies where tablename = 'message_threads' and policyname = 'participants_read_threads') then
    create policy "participants_read_threads" on public.message_threads for select
      using (auth.uid() = buyer_user_id or auth.uid() = seller_user_id); end if;
end $$;
