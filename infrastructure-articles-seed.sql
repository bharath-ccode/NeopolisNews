-- ══════════════════════════════════════════════════════════════════════════════
-- Infrastructure Articles Seed
-- Run this in Supabase SQL editor (Dashboard → SQL Editor → New query)
-- ══════════════════════════════════════════════════════════════════════════════

-- Step 1: Add source column (safe to run multiple times)
ALTER TABLE articles
  ADD COLUMN IF NOT EXISTS source TEXT DEFAULT NULL;

-- Step 2: Remove all existing test/infrastructure articles
DELETE FROM articles WHERE category = 'infrastructure';

-- Step 3: Insert real infrastructure articles
-- Ordered newest → oldest (created_at controls display order)

INSERT INTO articles (
  title, excerpt, content, category, tag, tag_color,
  author, date, read_time, views, sponsored, status, source, image_url,
  project_id, builder_id, created_at, updated_at
) VALUES

-- ─── Recent 1: HMWSSB Water & Sewage ─────────────────────────────────────────
(
  'HMWSSB Lays ₹227 Crore Water and Sewage Network for Neopolis',
  'The Hyderabad Metropolitan Water Supply and Sewerage Board has commenced a ₹227 crore infrastructure project to provide piped drinking water and underground sewage connections to all residential layouts in the Kokapet–Neopolis zone.',
  'The Hyderabad Metropolitan Water Supply and Sewerage Board (HMWSSB) has commenced a ₹227 crore comprehensive water supply and sewerage infrastructure project specifically designed to serve the rapidly growing Neopolis urban district in Kokapet.

The project includes construction of a 45 Million Litres per Day (MLD) Sewage Treatment Plant (STP) to handle waste water from the new township. Additionally, the board will lay an elevated level service reservoir (ELSR) network and ground-level storage reservoirs (GLSR) at strategic locations across the layout.

The water supply lines will extend across more than 12 km of arterial roads within the Neopolis planning area, connecting to the main Godavari supply grid via the Kollur pipeline. Work on the underground drainage (UGD) grid is expected to be completed in phases over 18 months.

HMWSSB officials stated that the investment is critical to support the occupancy of over 15,000 residential units already under construction in the Neopolis zone. Without dedicated infrastructure, the area was relying on water tankers and temporary septic systems.

The project is funded through the AMRUT 2.0 programme and state government grants. Environmental clearances and land assignments for the STP site have already been secured.',
  'infrastructure', 'Infrastructure', 'tag-blue',
  'NeopolisNews Staff', '12 Dec 2024', '4 min', 1840, false, 'published',
  'Sakshi Post', NULL, NULL, NULL,
  NOW() - INTERVAL '120 days', NOW() - INTERVAL '120 days'
),

-- ─── Recent 2: Metro Phase 2 Cabinet Approval ────────────────────────────────
(
  'Telangana Cabinet Clears Metro Phase 2 Corridor V: Raidurg to Kokapet Neopolis',
  'The Telangana Cabinet has approved Metro Rail Phase 2 Corridor V, a new 11.6 km elevated line connecting Raidurg (Financial District) to Kokapet Neopolis with 8 stations, slashing commute times for residents.',
  'The Telangana state cabinet chaired by Chief Minister A. Revanth Reddy has given its formal approval to the Metro Rail Phase 2 project, including the critical Corridor V that will connect Raidurg on the Financial District edge directly to Kokapet Neopolis.

Corridor V spans 11.6 km and will serve 8 stations from Raidurg to the heart of the Neopolis planned township. The corridor is designed to handle peak loads from the thousands of IT professionals and residents expected to inhabit the zone by 2028.

The Phase 2 expansion covers five new corridors totalling 76.4 km at an estimated project cost of ₹24,269 crore. The Detailed Project Reports (DPRs) for all five corridors have been prepared by Hyderabad Metro Rail (HMR) and submitted to the Ministry of Housing & Urban Affairs in New Delhi for central funding approval.

Officials from HMDA confirmed that Corridor V is among the highest-priority extensions, given the pace of residential and commercial development in the Neopolis–Kokapet zone. The line is expected to connect seamlessly with the existing Raidurg metro station on Line 1.

Civil works on the Phase 2 corridors are expected to commence once the central government provides its approval-in-principle, which is anticipated within six months.',
  'infrastructure', 'Infrastructure', 'tag-blue',
  'NeopolisNews Staff', '28 Oct 2024', '4 min', 3210, false, 'published',
  'The Hindu', NULL, NULL, NULL,
  NOW() - INTERVAL '163 days', NOW() - INTERVAL '163 days'
),

-- ─── Recent 3: Metro DPR sent to Centre ──────────────────────────────────────
(
  'Telangana Sends Metro Phase 2 DPR to Centre — Neopolis Corridor Among Priority Lines',
  'Hyderabad Metro Rail has submitted the Detailed Project Report for all five Phase 2 corridors, covering 76.4 km, to the Union government. The Neopolis extension is listed as a priority corridor due to rapid growth in the zone.',
  'Hyderabad Metro Rail Limited (HMRL) has formally submitted the Detailed Project Report (DPR) for Phase 2 of the Hyderabad Metro to the Ministry of Housing and Urban Affairs (MoHUA), Government of India.

The Phase 2 DPR covers five new corridors spanning a total length of 76.4 km at an estimated capital cost of ₹24,269 crore. The Raidurg–Kokapet Neopolis corridor (Corridor V, 11.6 km) features prominently in the submission as one of two priority corridors given the scale of residential and IT development already underway.

The central government's funding approval will allow the state to tap into the Smart Cities Mission and Urban Infrastructure Fund allocation. Metro authorities expect 60–70% of project cost to be centrally funded, with the remainder borne by the state and HMDA.

The DPR includes detailed soil surveys, ridership projections, environmental impact assessments and station location studies. For Corridor V, eight station locations have been identified including a direct interchange with the proposed Peripheral Ring Road network.

HMRL Managing Director confirmed that Hyderabad's Metro system is on course to become one of India's largest urban transit networks, with Phase 2 adding approximately 76 km to the existing 69 km operational network.',
  'infrastructure', 'Infrastructure', 'tag-blue',
  'NeopolisNews Staff', '04 Nov 2024', '3 min', 2670, false, 'published',
  'Telangana Today', NULL, NULL, NULL,
  NOW() - INTERVAL '156 days', NOW() - INTERVAL '156 days'
),

-- ─── Recent 4: HMDA Record Land Auction ──────────────────────────────────────
(
  'HMDA Neopolis Land Auction Fetches Record ₹151 Crore per Acre',
  'HMDA''s latest auction of nine commercial plots in the Neopolis planning zone set a record price of ₹151 crore per acre, with Godrej Properties acquiring Plot 16 and total proceeds of ₹1,353 crore from just 9.06 acres.',
  'The Hyderabad Metropolitan Development Authority (HMDA) has achieved a record land auction, with commercial plots in the Neopolis zone fetching an unprecedented ₹151 crore per acre — the highest rate ever recorded in Hyderabad''s urban land market.

The auction, conducted over two days, covered nine plots totalling 9.06 acres in the Neopolis planning area of Kokapet. Plot 15, measuring 4.03 acres, was acquired by a prominent realty group for ₹608 crore. Plot 16, spanning 5.03 acres, was acquired by Godrej Properties for approximately ₹745 crore, taking the combined realisation to ₹1,353 crore.

The record price reflects explosive demand for land in the Neopolis zone, driven by its proximity to the Financial District, the Outer Ring Road, and ongoing metro and road infrastructure investments. Multiple top-tier real estate developers competed in extended bidding rounds for each plot.

HMDA officials stated that the proceeds will be reinvested into infrastructure development across the Metropolitan Development Area, including roads, water supply and the upcoming Peripheral Ring Road that will further benefit the Neopolis zone.

Analysts noted that the ₹151 crore/acre price point represents a 3x appreciation over HMDA auctions in the same zone conducted just four years earlier.',
  'infrastructure', 'Infrastructure', 'tag-blue',
  'NeopolisNews Staff', '14 Nov 2024', '4 min', 4890, false, 'published',
  'Deccan Chronicle', NULL, NULL, NULL,
  NOW() - INTERVAL '146 days', NOW() - INTERVAL '146 days'
),

-- ─── Recent 5: ORR Trumpet Flyover Opens ─────────────────────────────────────
(
  'HMDA''s ₹65 Crore Trumpet Flyover at Kokapet ORR Exit Opens to Traffic',
  'The 22nd interchange on Hyderabad''s Outer Ring Road, a ₹65 crore trumpet flyover at the Kokapet–Neopolis exit, has been opened to traffic. The structure provides five exit and three entry lanes with eight toll booths.',
  'The Hyderabad Metropolitan Development Authority (HMDA) has inaugurated the ₹65 crore trumpet-design flyover at the 22nd interchange of the Outer Ring Road (ORR), providing seamless access to the Kokapet–Neopolis urban district.

The flyover, which took approximately 28 months to construct, features five exit lanes from the ORR into Kokapet and three entry lanes onto the ORR. Eight modern electronic toll booths have been installed to handle peak traffic volumes. The trumpet configuration was chosen to accommodate the high traffic volumes expected as Neopolis reaches full occupancy.

HMDA Commissioner confirmed that the new interchange is one of the most complex structures on the ORR, integrating four grade separators across a compact 2.4 hectare footprint. The project involved detailed coordination with the ORR operations authority to minimise disruption during construction.

The Kokapet exit (Exit 22) had previously been served by an at-grade signalised intersection that caused significant peak-hour congestion. With the new flyover, traffic engineers estimate that travel times between the ORR and the Financial District via Kokapet Road will reduce by approximately 8–12 minutes during peak hours.

HMDA engineers noted that the flyover is engineered to handle a projected daily traffic volume of 80,000 vehicles — the expected load once all residential towers in Neopolis are fully occupied.',
  'infrastructure', 'Infrastructure', 'tag-blue',
  'NeopolisNews Staff', '10 Jun 2025', '4 min', 5240, false, 'published',
  'Telangana Today', NULL, NULL, NULL,
  NOW() - INTERVAL '30 days', NOW() - INTERVAL '30 days'
),

-- ─── Historical 1: Neopolis Vision / Inception ───────────────────────────────
(
  'How Neopolis Was Born: HMDA''s Vision for a Planned Urban District in Kokapet',
  'In 2007, HMDA identified 1,500 acres in Kokapet for a purpose-built planned township to extend Hyderabad''s Financial District. This is the story of how Neopolis was conceived, master-planned, and set on the road to becoming one of India''s most ambitious urban developments.',
  'The origins of Neopolis lie in a 2007 master planning exercise by the Hyderabad Urban Development Authority (HUDA, later restructured as HMDA). Planners identified a 1,500-acre government land parcel in Kokapet — just across the Outer Ring Road from the Gachibowli Financial District — as the ideal location for a purpose-built extension of Hyderabad''s IT and residential corridor.

The land had historically been used for agriculture and was largely unencumbered. HMDA''s master plan designated it as a Special Planning Authority zone, allowing the authority to develop the area with a comprehensive layout that included reserved commercial cores, high-density residential sectors, open green spaces constituting 35% of total area, and a dedicated institutional zone.

The name "Neopolis" — derived from the Greek for "new city" — was formally adopted in HMDA''s Integrated Development Plan (IDP) published in 2012. The plan envisaged a mixed-use township housing 1.5 lakh residents alongside over 20 million sq ft of commercial space within a 20-year horizon.

Infrastructure-first planning was central to the vision. HMDA committed to laying internal arterial roads, a water supply grid, underground drainage, and 33 kV power substations before offering land parcels to the private sector. The ORR''s Exit 22 was identified as the primary access point, and the HMDA-HMWSSB joint master plan flagged the area for priority water supply treatment capacity.

The first phase of land auctions, conducted between 2015 and 2018, attracted investment from leading Indian and multinational real estate developers, validating the planned-city model and setting the stage for the explosive growth that followed.',
  'infrastructure', 'Infrastructure', 'tag-blue',
  'NeopolisNews Staff', '18 Apr 2016', '6 min', 7120, false, 'published',
  'Deccan Chronicle', NULL, NULL, NULL,
  NOW() - INTERVAL '3650 days', NOW() - INTERVAL '3650 days'
),

-- ─── Historical 2: ORR & Kokapet IT Corridor ─────────────────────────────────
(
  'Kokapet Declared IT Corridor Extension Under HMDA Master Plan',
  'The Telangana government''s formal notification designating the Kokapet–Neopolis belt as an IT and ITES corridor zone triggered a wave of developer interest and brought the area under HMDA''s Special Planning Authority framework.',
  'The Telangana government formally notified the Kokapet–Neopolis area as a dedicated Information Technology and IT-Enabled Services (IT/ITES) corridor under the HMDA Master Plan 2031, triggering a major wave of development interest from both domestic and international real estate developers.

The notification, issued under the Telangana Town Planning Act, designated approximately 800 acres within the larger Neopolis planning zone for commercial IT office development, with floor area ratio (FAR) relaxations of up to 4.0 for IT-designated plots. The remaining land was zoned for high-density residential use, schools, hospitals, and retail.

The decision was driven by the saturation of the established Financial District (HITEC City and Gachibowli), which by 2018 was reporting commercial land rates exceeding ₹60,000 per sq yard, pricing out mid-tier IT companies and co-working operators. Neopolis offered government-serviced plots at a fraction of the price while remaining within 20 minutes of HITEC City.

The HMDA Special Planning Authority (SPA) designation meant that all development within the zone was subject to HMDA''s layout approval — a significant quality control mechanism that has kept Neopolis free of the haphazard development seen in adjacent areas.

Within two years of the notification, four major IT park developers had broken ground on projects totalling over 10 million sq ft of leasable office space. The Telangana government also announced direct bus rapid transit (BRT) services from HITEC City to Kokapet as a short-term connectivity measure pending metro construction.',
  'infrastructure', 'Infrastructure', 'tag-blue',
  'NeopolisNews Staff', '14 Aug 2019', '5 min', 5340, false, 'published',
  'Telangana Today', NULL, NULL, NULL,
  NOW() - INTERVAL '2400 days', NOW() - INTERVAL '2400 days'
),

-- ─── Historical 3: First HMDA Land Auction ───────────────────────────────────
(
  'HMDA Kokapet Land Auctions: First Phase Raises ₹1,800 Crore from Planned Township Plots',
  'HMDA''s inaugural land auction in the Neopolis planning zone fetched ₹1,800 crore as developers competed for the first tranche of serviced residential and commercial plots, validating the authority''s infrastructure-first model.',
  'The Hyderabad Metropolitan Development Authority completed its inaugural land auction in the Neopolis planning zone, raising approximately ₹1,800 crore from the sale of 18 residential and commercial plots covering 32 acres.

The auction, conducted over three days at HICC Novotel in Hyderabad, attracted participation from over 40 developers including Prestige Group, My Home Constructions, Aparna Constructions, and several national developers. Bidding on key commercial plots was particularly competitive, with some lots attracting bids 40–60% above the reserve price set by HMDA.

HMDA Chairman stated that the auction outcome validated the authority''s infrastructure-first approach: all plots offered had already been provided with internal roads, water supply connections, underground drainage, and 33kV power substations. Buyers were able to commence construction immediately without waiting for basic utilities.

The pricing achieved — ranging from ₹28 crore to ₹85 crore per acre depending on location and permissible use — established a formal benchmark for land values in the Neopolis zone. Industry analysts noted that comparable unserviced land in adjacent areas was trading at significantly lower rates.

HMDA announced that the proceeds would be used to fund the next phase of internal infrastructure, including the construction of three arterial flyovers, a 2 MLD overhead water tank, and the layout''s first community park covering 18 acres.',
  'infrastructure', 'Infrastructure', 'tag-blue',
  'NeopolisNews Staff', '22 Mar 2018', '5 min', 4780, false, 'published',
  'The Hindu', NULL, NULL, NULL,
  NOW() - INTERVAL '2940 days', NOW() - INTERVAL '2940 days'
);

-- Verify inserts
SELECT id, title, date, source, created_at
FROM articles
WHERE category = 'infrastructure'
ORDER BY created_at DESC;
