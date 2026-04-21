-- ============================================================
-- NeopolisNews — Supabase Setup SQL
-- Run this entire file in: Supabase Dashboard → SQL Editor → New query
-- ============================================================


-- ── 1. Articles table ────────────────────────────────────────────────────────

create table if not exists articles (
  id         uuid        primary key default gen_random_uuid(),
  title      text        not null,
  excerpt    text        not null,
  content    text        not null,
  category   text        not null check (category in ('construction','launches','infrastructure','community')),
  tag        text        not null,
  tag_color  text        not null,
  author     text        not null default 'NeopolisNews Staff',
  date       text        not null,
  read_time  text        not null default '3 min',
  views      integer     not null default 0,
  sponsored  boolean     not null default false,
  status     text        not null default 'draft' check (status in ('draft','published')),
  image_url  text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);


-- ── 2. Auto-update updated_at ─────────────────────────────────────────────────

create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists articles_updated_at on articles;
create trigger articles_updated_at
  before update on articles
  for each row execute function update_updated_at();


-- ── 3. Row Level Security ─────────────────────────────────────────────────────

alter table articles enable row level security;

-- Public visitors: read published articles only
create policy "public_read_published"
  on articles for select
  to anon
  using (status = 'published');

-- Logged-in admin: full access to all rows
create policy "admin_full_access"
  on articles for all
  to authenticated
  using (true)
  with check (true);


-- ── 4. Seed data — 7 starter articles ────────────────────────────────────────

insert into articles (title, excerpt, content, category, tag, tag_color, author, date, read_time, views, sponsored, status) values

('Metro Connectivity to Neopolis Confirmed — Phase 2 Station Announced by DMRC',
 'The Delhi Metro Rail Corporation has officially confirmed a Phase 2 extension that will bring a metro station directly into the Neopolis district by mid-2028.',
 'The Delhi Metro Rail Corporation has officially confirmed a Phase 2 extension that will bring a metro station directly into the Neopolis district by mid-2028. The announcement is expected to push property values up by 15–25% over the next 24 months, according to real estate analysts.

The new station, tentatively named ''Neopolis Central'', will be part of the Blue Line extension. Construction is expected to begin in Q1 2027, with the station operational by June 2028.

Real estate experts have already noted increased buyer interest in the district following the announcement, with enquiries up 40% in the week after the announcement.',
 'infrastructure', 'Infrastructure', 'tag-blue', 'NeopolisNews Staff', 'March 15, 2026', '5 min', 8421, false, 'published'),

('Apex Tower Reaches 18th Floor Slab — On Schedule for Dec 2026 Delivery',
 'Apex Realty confirms structural milestone. Tower A completes 18th floor slab cast; Tower B at 14th floor.',
 'Apex Realty has confirmed a major structural milestone for their flagship development in Neopolis. Tower A has successfully completed the 18th floor slab casting, while Tower B is progressing at the 14th floor level.

Project Director Rajesh Kumar stated that the development remains on schedule for December 2026 delivery. The project currently employs over 800 construction workers on-site.',
 'construction', 'Construction', 'tag-orange', 'NeopolisNews Staff', 'Mar 20, 2026', '3 min', 3210, false, 'published'),

('Phase 3 Residential Towers Open for Pre-Bookings — Prices Start ₹85 Lakh',
 'SkyLine Corp opens Phase 3 pre-bookings with early-bird pricing. 120 ultra-luxury units launching.',
 'SkyLine Corp has announced the opening of pre-bookings for Phase 3 of their residential development in Neopolis. The launch includes 120 ultra-luxury units across two towers, with early-bird prices starting at ₹85 lakh.

The units range from 2 BHK (1,200 sq ft) to 4 BHK penthouses (2,800 sq ft). Early bird buyers receive a 5% discount and priority floor selection.',
 'launches', 'New Launch', 'tag-green', 'NeopolisNews Staff', 'Mar 10, 2026', '4 min', 5820, true, 'published'),

('Neopolis RWA Formed — First General Body Meeting Scheduled for April 5',
 'Residents of Neopolis Business Park and Apex Tower form a joint Residents Welfare Association.',
 'Residents of Neopolis Business Park and Apex Tower have come together to form a joint Residents Welfare Association (RWA). The inaugural general body meeting is scheduled for April 5, 2026.

The RWA will focus on community welfare, maintenance standards, security, and liaising with the municipal corporation for local infrastructure improvements.',
 'community', 'Community', 'tag-purple', 'Community Desk', 'Mar 8, 2026', '2 min', 2100, false, 'published'),

('6-Lane Arterial Road to Neopolis Gets NHAI Approval — Work Begins Q3 2026',
 'National Highways Authority of India approves the 14km arterial road connecting Neopolis to NH-48.',
 'The National Highways Authority of India (NHAI) has approved the construction of a 14km, 6-lane arterial road that will directly connect Neopolis to National Highway 48.

Work is expected to begin in Q3 2026. The road will significantly reduce commute times to the district from central areas, cutting travel time by an estimated 35 minutes during peak hours.',
 'infrastructure', 'Infrastructure', 'tag-blue', 'NeopolisNews Staff', 'Mar 5, 2026', '4 min', 4650, false, 'published'),

('Grand Mall Foundation Complete — Steel Frame Erection Begins Next Week',
 'Retail Spaces Ltd confirms completion of raft foundation for Neopolis Grand Mall''s 5-level structure.',
 'Retail Spaces Ltd has confirmed the completion of the raft foundation for the Neopolis Grand Mall, a 5-level retail and entertainment complex scheduled to open in late 2027.

Steel frame erection is set to begin next week. The mall will feature 250+ retail outlets, a multiplex cinema, food court, and indoor entertainment zone spread across 8 lakh square feet of built-up area.',
 'construction', 'Construction', 'tag-orange', 'NeopolisNews Staff', 'Mar 3, 2026', '3 min', 2980, false, 'published'),

('Neopolis Food Festival 2026 — Full Schedule & Participating Brands Revealed',
 'The inaugural Neopolis Food Festival will run April 5–7 with 60+ food brands, live music, and chef showdowns.',
 'The inaugural Neopolis Food Festival is set to run from April 5–7, 2026, featuring over 60 food brands, live music performances, and competitive chef showdowns.

Event highlights include a Regional Cuisine Pavilion, Craft Beer Garden, Kids Food Art Workshop, and the Grand Chef Showdown with a ₹5 lakh prize.

Entry is free; food tokens available at ₹100 each. The festival will be held at the Neopolis Central Park.',
 'community', 'Community', 'tag-purple', 'Events Desk', 'Feb 28, 2026', '3 min', 6200, true, 'published');


-- ── Done ──────────────────────────────────────────────────────────────────────
-- Next step: create your admin user in Supabase Dashboard
--   Authentication → Users → Add user
--   Email: admin@neopolisnews.com
--   Password: (your chosen password)
-- ============================================================
