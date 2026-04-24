-- now_showing: movies currently running at a cinema business
create table if not exists now_showing (
  id              uuid primary key default gen_random_uuid(),
  business_id     text not null references businesses(id) on delete cascade,
  title           text not null,
  poster_url      text,
  genres          text[] not null default '{}',
  languages       text[] not null default '{}',
  formats         text[] not null default '{}',   -- 2D, 3D, IMAX, 4DX, Dolby Atmos
  bms_url         text,
  running_from    date not null default current_date,
  running_until   date,
  created_at      timestamptz not null default now()
);

alter table now_showing enable row level security;

-- anyone can read
create policy "Public read now_showing"
  on now_showing for select using (true);

-- service role handles all writes via API routes (no RLS needed for inserts/deletes via admin client)
