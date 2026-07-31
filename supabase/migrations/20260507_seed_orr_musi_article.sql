-- Seed: Infrastructure article — Seven Roads to Link ORR with Musi Corridor
-- Run this in the Supabase SQL editor.
-- If you already ran the previous version, use the UPDATE at the bottom instead.

-- ── INSERT (if not yet added) ──────────────────────────────────────────────────
insert into public.articles (
  title,
  excerpt,
  content,
  category,
  tag,
  tag_color,
  author,
  date,
  read_time,
  views,
  sponsored,
  status,
  source,
  image_url,
  created_at,
  updated_at
) values (
  'Seven Roads to Link ORR with Musi Corridor in Hyderabad, Ease Traffic',

  'MRDCL is developing seven master plan roads across Budvel, Kothwalguda and Gandipet to improve connectivity between the Outer Ring Road and key urban stretches, easing traffic and supporting future growth.',

  '<p>Hyderabad is set to witness a major leap in urban connectivity as the Musi Riverfront Development Corporation Limited (MRDCL) rolls out an ambitious plan to reshape the road network across <strong>Budvel, Kothwalguda and Gandipet</strong> — three of the city''s fastest-growing areas.</p>

<p>The move aims to improve connectivity between the Outer Ring Road (ORR) and key urban stretches, easing traffic and supporting future growth. MRDCL has initiated development of master plan roads integrated with the proposed <strong>East-West Corridor along River Musi</strong> to reduce congestion in these high-growth areas. Seven such roads have been proposed.</p>

<h2>The Seven Roads</h2>
<ol>
  <li><strong>Osmansagar to Narsingi</strong> — 5.4 km, RoW 30 metres</li>
  <li><strong>Osmansagar to ORR Service Road</strong> — 2.3 km, RoW 30 metres</li>
  <li><strong>Kismatpur Bridge to HMDA Budvel Rangareddy Layout (L-M1)</strong> — 1.1 km, RoW 30 metres</li>
  <li><strong>HMDA Budvel Layout to Rangareddy Shivam Road</strong> — 3.5 km, RoW 30 metres</li>
  <li><strong>NIRD Road, Police Quarters, Rajendranagar to SS Convention, Airport Road, Sathamrai Colony, Shamshabad</strong> — 5 km, RoW 36 metres</li>
  <li><strong>Kismatpur Bridge to HMDA Budvel Rangareddy Layout (L-N)</strong> — 3 km, RoW 36 metres</li>
  <li><strong>Isthana Villas to Gandipet Road</strong> — 1.2 km, RoW 18 metres</li>
</ol>

<h2>Standardised Right of Way</h2>
<p>By standardising these roads with RoW between 30 and 36 metres, the project aims to transform the local grid into a more organised arterial system. The integration of Budvel, Kothwalguda and Gandipet is particularly strategic given the massive HMDA layouts and the residential and commercial projects coming up in these areas.</p>

<h2>About the Musi Riverfront Development Project</h2>
<p>The Musi Riverfront Development Project (MRDP) is a flagship initiative of the Telangana government, aimed at rejuvenating the <strong>55 km stretch of River Musi</strong> into a clean, sustainable urban asset through ecological restoration and infrastructure development, managed by MRDCL.</p>

<p>The corporation has invited requests for proposals for the preparation of a detailed project report to develop these master plan roads, integrated with the proposed East-West Corridor. The selected agency will conduct surveys, traffic studies and projections up to 2047, determine lane requirements, and design road infrastructure including signage, junctions, drainage, safety measures and utilities, along with cost estimates. Consultants will also assess existing structures including bridges and culverts, and carry out further testing for distressed structures as per IRC norms.</p>',

  'infrastructure',
  'Infrastructure',
  'tag-blue',
  'S Bachan Jeet Singh',
  'May 1, 2026',
  '2 min read',
  0,
  false,
  'published',
  'New Indian Express',
  null,
  now(),
  now()
);

-- ── UPDATE (if you already ran the old version) ────────────────────────────────
-- Uncomment and run this block instead if the article is already in the DB:
/*
update public.articles set
  title      = 'Seven Roads to Link ORR with Musi Corridor in Hyderabad, Ease Traffic',
  excerpt    = 'MRDCL is developing seven master plan roads across Budvel, Kothwalguda and Gandipet to improve connectivity between the Outer Ring Road and key urban stretches, easing traffic and supporting future growth.',
  content    = '<p>Hyderabad is set to witness a major leap in urban connectivity as the Musi Riverfront Development Corporation Limited (MRDCL) rolls out an ambitious plan to reshape the road network across <strong>Budvel, Kothwalguda and Gandipet</strong> — three of the city''s fastest-growing areas.</p>

<p>The move aims to improve connectivity between the Outer Ring Road (ORR) and key urban stretches, easing traffic and supporting future growth. MRDCL has initiated development of master plan roads integrated with the proposed <strong>East-West Corridor along River Musi</strong> to reduce congestion in these high-growth areas. Seven such roads have been proposed.</p>

<h2>The Seven Roads</h2>
<ol>
  <li><strong>Osmansagar to Narsingi</strong> — 5.4 km, RoW 30 metres</li>
  <li><strong>Osmansagar to ORR Service Road</strong> — 2.3 km, RoW 30 metres</li>
  <li><strong>Kismatpur Bridge to HMDA Budvel Rangareddy Layout (L-M1)</strong> — 1.1 km, RoW 30 metres</li>
  <li><strong>HMDA Budvel Layout to Rangareddy Shivam Road</strong> — 3.5 km, RoW 30 metres</li>
  <li><strong>NIRD Road, Police Quarters, Rajendranagar to SS Convention, Airport Road, Sathamrai Colony, Shamshabad</strong> — 5 km, RoW 36 metres</li>
  <li><strong>Kismatpur Bridge to HMDA Budvel Rangareddy Layout (L-N)</strong> — 3 km, RoW 36 metres</li>
  <li><strong>Isthana Villas to Gandipet Road</strong> — 1.2 km, RoW 18 metres</li>
</ol>

<h2>Standardised Right of Way</h2>
<p>By standardising these roads with RoW between 30 and 36 metres, the project aims to transform the local grid into a more organised arterial system. The integration of Budvel, Kothwalguda and Gandipet is particularly strategic given the massive HMDA layouts and the residential and commercial projects coming up in these areas.</p>

<h2>About the Musi Riverfront Development Project</h2>
<p>The Musi Riverfront Development Project (MRDP) is a flagship initiative of the Telangana government, aimed at rejuvenating the <strong>55 km stretch of River Musi</strong> into a clean, sustainable urban asset through ecological restoration and infrastructure development, managed by MRDCL.</p>

<p>The corporation has invited requests for proposals for the preparation of a detailed project report to develop these master plan roads, integrated with the proposed East-West Corridor. The selected agency will conduct surveys, traffic studies and projections up to 2047, determine lane requirements, and design road infrastructure including signage, junctions, drainage, safety measures and utilities, along with cost estimates. Consultants will also assess existing structures including bridges and culverts, and carry out further testing for distressed structures as per IRC norms.</p>',
  author     = 'S Bachan Jeet Singh',
  date       = 'May 1, 2026',
  read_time  = '2 min read',
  updated_at = now()
where title ilike '%seven roads%musi%';
*/
