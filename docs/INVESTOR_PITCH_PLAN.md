# NeopolisNews — 15-Day Investor Pitch Runway (Aug 1 → Aug 17)

Working document for the Aug 17 investor pitch. Two tracks run in parallel:
**Track A** — get the website/data ready. **Track B** — sharpen the story (the 5 streams).

Grounded in what exists today: 6 live modules (Real Estate, Rentals, Directory,
News, Services, Advertise), lead forms on every page, auth + dashboards for
individuals and businesses, 12,000+ registered users, daily news + cartoons
driving engagement.

---

## Progress Update — Aug 13

**⚠️ Blocker, top priority: production is not updated yet.** Everything below
is built and pushed to the `claude/neopolis-investor-pitch-bia6bv` branch on
GitHub, but neopolis.news only updates via a **manual promote in the Vercel
dashboard** — pushing to GitHub does not deploy it by itself. None of this
work is live on neopolis.news as of this update. **Action: promote the
latest deployment for this branch in Vercel before Aug 17.**

### Track A, Item 2 — Health & Medical listings (was Days 1–5)

Built a **Business Discovery pipeline** (`/admin/business-discovery`) as the
mechanism to hit the "20+ real health listings" target — reusable for every
future industry, not a one-off data-entry job:

- Google Places search, staged for admin review before anything publishes —
  no auto-publish, every listing gets a human look.
- 3-step wizard: pick an industry (all 7 in the taxonomy, not just Health &
  Wellness) → pick a locality → then either search by name (find one specific
  business, confirm the right match, add it) or run a bulk sweep across
  type/subtype × locality.
- Health & Wellness fully configured: Hospital, 28 clinical specialities,
  Diagnostics, Pharmacies, 10 Wellness subtypes (spas, gyms, studios, etc.) —
  42 searchable subtypes.
- Approve All (bulk approve), Clear All Results, and — the fix that actually
  makes the target hittable — an approved listing flips straight to
  `status: active` and is searchable immediately, instead of sitting behind
  a separate claim step nobody would complete in time for the pitch.
- `/health/wellness` was 100% hardcoded mock data (fictional spas/gyms/
  trainers) — now pulls real approved listings the same way `/health`
  already did.
- Data-quality fixes made along the way: locality-restricted search (a
  Kokapet search no longer returns Manikonda results), unclaimed listings
  hide the "request appointment" form (nobody could see those requests) and
  point to the call button instead, `/admin/businesses` got Industry/Type/
  Subtype filters + delete for cleaning up duplicates.

**Still open:** the tool is ready — actually running Discovery across the
district and approving listings to reach 20+ live hasn't happened yet.
Recommend this as the next working session before Aug 17.

### Track A, Item 4 — Movie tickets v1.5 (was Days 6–10) — done

Instrumented every "Book Tickets" / "View Showtimes & Book" click-through
to BookMyShow, from both the cinemas page and a cinema's Now Showing
section on its business profile:

- New `ticket_click_events` table, written to via a public, rate-limited,
  anonymous `/api/ticket-clicks` — no login required, matches how the
  clicks actually happen.
- `/admin/analytics` now opens with a **real, non-simulated** "Ticket-Intent
  Clicks" card (all-time / 30-day / 7-day totals, top cinemas, top movies)
  — clearly marked apart from the rest of that page, which is still
  simulated demo data. This is the exact number to show investors and the
  negotiating card with PVR/BookMyShow.

**Still open:** the counter starts at zero until this ships to production
and gets real traffic — the earlier the promote happens, the more days of
click data there'll be to show on Aug 17.

### Other shipped this session

- `/real-estate` now has a Cards/List view toggle (List styled like the
  admin projects table); Compare works identically from either view.
- Locality list widened from 11 to 18 (added Velimala, Kollur, Janwada,
  Khanapur, Vattinagulapally, Mokila, Manchirevula).
- Taxonomy cleanup: Saloon moved out of Health & Wellness into Services →
  Beauty and Personal Care (Hair Saloon, Nail Spa, Makeup Saloon).

---

## Track A — Website & Data (15 days)

### Days 1–5 (Aug 1–5): Data depth — answer what users are already asking for

1. **Project data.** Users want more project data. Deepen the 3 featured
   projects into full project pages: monthly construction-progress photos,
   price history table, floor-plan gallery, delivery-timeline tracker. Add
   every named project in the district, even "Coming Soon" ones — coverage
   completeness is the moat claim.
2. **Fill the Health & Medical section with real businesses.** The site
   already has a full Health section (hospitals, clinics, diagnostics,
   pharmacies, wellness) — the gap is inventory, not features. Set a hard
   target: **20+ real health listings live before Aug 17** (see onboarding
   sprint below), each with hours, photos, and a bookable CTA.
3. **Protect the engagement engine.** Daily news + cartoons is the proven
   habit loop — do not let pitch prep break the streak. Pre-write 5 days of
   buffer content now.

### Days 6–10 (Aug 6–11): Conversion features — turn browsing into transactions

4. **Movie tickets, phased.** The cinemas page already deep-links to
   BookMyShow per cinema and date — v1 is shipped. Next steps:
   - **v1.5 (ship by Aug 11):** instrument the "book tickets" clicks. That
     click-through data *is* the demand proof investors want, and it's your
     negotiating card with PVR/BookMyShow for a revenue-share or white-label
     integration later.
   - **v2 (post-pitch):** native/white-label ticketing partnership. In the
     pitch, show the live flow + v2 on the roadmap slide with the intent
     numbers.
5. **Self-serve business onboarding.** The /register-business flow and
   My Business console (offers, events, bookings, reviews, enquiries)
   already exist. Polish the funnel — /for-businesses pitch page →
   /register-business → first offer posted — and track drop-off at each
   step. This is the thing you demo live to investors.
6. **Instrument everything.** Page views, lead-form submissions by purpose
   (the LeadForm component already tags `purpose`), ticket-intent clicks,
   news/cartoon dwell time. Fourteen days of clean analytics is a small but
   honest traction chart.

### Days 11–15 (Aug 12–16): Investor readiness

7. **Metrics dashboard** (one screen): registered users, DAU/WAU, listings
   by category, leads generated this month, ticket-intent clicks, news
   streak. Use it live in the pitch.
8. **Feature freeze Aug 14.** Bug fixes and content only after that. Record
   a backup demo video in case of live-demo failure.
9. **Aug 15–16:** dry runs of the pitch with the demo, tighten to time.

### Parallel field sprint (Days 1–10): Health business onboarding
- List every health business in/around the district (~walk the district +
  Google Maps sweep). Door-to-door with a tablet: free listing created on
  the spot in 5 minutes, photo taken, offer captured.
- Incentive: **first 25 health businesses get 6 months of premium free.**
- Target: 20+ live, 3 with a real offer/appointment CTA for the demo.

---

## Track B — The 5 Streams (messaging framework)

Each stream is written for both audiences: the **resident/user** and the
**business**. Use these verbatim on the website, in the deck, and in the
onboarding script.

### Stream 1 — What you'll see as a result of onboarding

**User:** "One account for your entire district. Track your tower's
construction progress with photo updates, get price alerts, see today's
showtimes and this week's offers from every store in the mall, book a
doctor's appointment nearby, and start every morning with local news and
the daily cartoon."

**Business:** "A verified listing page with your hours, photos, offers and
events — visible to 12,000+ registered residents and workers within walking
distance of your door. A monthly report of exactly how many people viewed
you, called you, and asked for directions."

### Stream 2 — How our solution helps

**User:** "Today you need six apps for one neighbourhood — a property
portal, a broker, Google Maps, BookMyShow, a newspaper, and a WhatsApp
group. We replace all six for the neighbourhoods you actually live in.
Everything is verified, current, and walking-distance relevant."

**Business:** "Every rupee you spend elsewhere reaches people who will
never visit your store. Every impression on NeopolisNews is a person who
lives or works within 15 minutes of you. We sell footfall, not
impressions."

### Stream 3 — There is no risk in trying

**User:** Free forever for residents. Browse without an account. No payment
details ever asked. Unsubscribe from anything in one tap.

**Business:** The basic listing is free, forever. Premium comes with a
30-day free trial, monthly billing, cancel anytime — no annual lock-in to
start. Your Google and Justdial presence stays untouched; we add a channel,
we don't replace one. If the monthly report shows no leads, you've lost
nothing.

### Stream 4 — Why we score over the competition

| Competitor | Their game | Our edge |
|---|---|---|
| 99acres / MagicBricks / NoBroker | Whole-city breadth | Tower-by-tower depth: live construction %, verified inventory, price history for *this* district only |
| Justdial / Google Maps | Stale, unverified, city-wide | Curated, verified, district-only; live offers and events, not five-year-old phone numbers |
| BookMyShow | Tickets only | Tickets next to dinner reservations, mall offers, and parking — plan the whole evening in one place |
| City newspapers / WhatsApp groups | Noise, no accountability | Daily edited local news + cartoons people actually open, with an archive |

**The one-line moat:** we are the only platform that holds the *complete
graph* of one micro-city — developers, retailers, residents, and service
vendors reinforcing each other. Horizontal players can't match the depth;
another local player can't match the head start (daily content habit +
12,000 users + listings base).

### Stream 5 — Call to action (how we get them to onboard)

**User CTA:** "Claim your resident account." Founding-resident perks for
registering before the mall opening: ₹99-Tuesday movie alerts, priority
booking, offer notifications. Distribution: QR-code standees in lobbies and
the mall, WhatsApp broadcast of the daily cartoon (the cartoon is the
shareable hook — put the QR on it), every news article ends with the
register CTA.

**Business CTA:** "Claim your free listing in 5 minutes." First 25 health
businesses get 6 months premium free. Door-to-door tablet onboarding — the
business owner watches their page go live before you leave the shop. The
monthly leads report is the retention hook: it arrives on the 1st and does
the renewal conversation for you.

**On-site mechanics:** sticky "Claim your listing" button on every
directory page; every lead form followed up by phone within 24 hours.

---

## Pitch-day proof points (targets to hit by Aug 17)

- 20+ health & medical listings live, 3 with bookable offers
- Movie showtimes page live with N ticket-intent clicks (real number)
- Unbroken daily news + cartoon streak through pitch day
- 14 days of analytics: DAU/WAU, leads by category, top content
- One live demo path: resident view → project tracker → directory →
  book-tickets click → business claims a listing → dashboard shows the lead
