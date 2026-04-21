alter table public.businesses
  add column if not exists view_count integer not null default 0;

-- Atomic increment via RPC (avoids race conditions)
create or replace function increment_business_views(biz_id text)
returns void language sql security definer as $$
  update public.businesses set view_count = view_count + 1 where id = biz_id;
$$;
