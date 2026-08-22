# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # development server (Next.js)
npm run build    # production build
npm run start    # start production server
npm run lint     # ESLint
npx tsc --noEmit # type-check (no tsc script defined in package.json)
```

No test runner is configured.

## Environment Variables

Create `.env.local` with:

```
# Required
SUPABASE_SERVICE_ROLE_KEY=...     # bypasses RLS — server/API routes only
RESEND_API_KEY=...                # email delivery (Resend)
GOOGLE_TRANSLATE_API_KEY=...      # Cloud Translation API v2 — Telugu article translations
GOOGLE_AI_API_KEY=...             # Gemini API key (Imagen) — AI editorial illustrations; needs billing
GOOGLE_PLACES_API_KEY=...         # Places API (New) — monthly business discovery pipeline; needs billing
OTP_SECRET=...                    # HMAC secret for signing business OTP cookies

# Recommended
ADMIN_EMAIL=...                   # receives business verification notifications
ADMIN_EMAILS=...                  # comma-separated admin allowlist for /api/admin/* (middleware); falls back to ADMIN_EMAIL
NEXT_PUBLIC_VAPID_PUBLIC_KEY=...  # web push — generate with: npx web-push generate-vapid-keys
VAPID_PRIVATE_KEY=...             # web push private key (server only)
VAPID_SUBJECT=mailto:admin@neopolis.news  # web push contact
GOOGLE_SITE_VERIFICATION=...      # Search Console HTML-tag verification token (optional)
NEXT_PUBLIC_SOCIAL_LINKS=...      # comma-separated social profile URLs for Organization sameAs schema
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
NEXT_PUBLIC_SITE_URL=...          # defaults to https://neopolis.news
```

## Architecture

### Tech stack
Next.js 14 (App Router) · TypeScript · Tailwind CSS · Supabase (Postgres + Auth + Storage) · Resend (email)

### Supabase clients
Two clients live in `lib/supabase/`:
- `client.ts` — browser singleton (anon key); used in auth contexts and client components
- `server.ts` — exports `createClient()` (anon) and `createAdminClient()` (service-role, bypasses RLS); API routes use `createAdminClient()` for all writes

### Three auth systems (separate contexts)

| Context | File | Identity |
|---|---|---|
| Individual / customer | `context/AuthContext.tsx` | Supabase Auth OTP (email or phone), email+password, or Google OAuth |
| Admin | `context/AdminAuthContext.tsx` | Supabase email+password; rejects login if email is in `builders` table |
| Builder (real-estate developer) | `context/BuilderAuthContext.tsx` | Supabase email+password; requires matching row in `builders` table |

All three share the same `auth.users` table — the role is determined by which context is used and cross-checked against `builders` / RLS.

The individual auth stores sessions via `@supabase/supabase-js` in `localStorage`; middleware (`middleware.ts`) is a pass-through and does **not** enforce auth — all protection is client-side via context `useEffect` redirects.

### Individual user identity model
```
auth.users  (single identity per phone/email — created by any auth path)
    │
    ├── user_profiles      (1:1, individual profile — name, phone, location)
    └── businesses         (1:many, owned businesses — via owner_id FK)
```
A business owner who later registers as an individual (or vice versa) reuses the same `auth.users` row. `user_profiles` uses `upsert` with `onConflict: "user_id"` to ensure idempotency.

### Business onboarding — two paths

**Path A — Admin-created:**
1. Admin POSTs to `/api/businesses/register` → business inserted with `status="invited"`
2. Admin panel (`/admin/businesses`) manages the record
3. Owner receives a 24-hour claim link via `/api/admin/businesses/[id]/approve-claim`
4. Owner visits `/businesses/[id]/claim?token=…` → POSTs to `/api/businesses/[id]/complete` → `status="active"`, `owner_id` set

**Path B — Self-registered:**
1. Owner visits `/register-business`, submits phone → POST `/api/businesses/register` → `status="invited"`
2. OTP sent via Resend; token signed with `OTP_SECRET` and stored in httpOnly cookie
3. Owner verifies OTP → POST `/api/businesses/[id]/complete` → same completion as Path A

**Ownership verification (no owner on file):**  
Owner submits proof via `/api/businesses/[id]/verify-request` → `status="pending"` → admin approves/rejects via `/api/admin/businesses/[id]/approve-claim` or `reject-claim`.

After either path, the owner manages their listing at `/my-business` (JWT from `/my-business/login`).

### Data storage split

| Data | Where |
|---|---|
| Businesses, news, projects, builders, announcements | Supabase (Postgres) |
| Property listings (rentals/classifieds) | `localStorage` via `lib/listings.ts` (key: `neopolis_listings`) |
| Admin business list cache | `localStorage` via `lib/businessStore.ts` (key: `neopolis_businesses`) |
| Individual user session | `localStorage` (managed by Supabase JS client) |

### Key lib/ files
- `lib/businessDirectory.ts` — taxonomy of industries / types / subtypes; used for filtering and registration forms
- `lib/businessStore.ts` — localStorage CRUD for the admin business list
- `lib/projectsStore.ts` — Supabase CRUD for real-estate projects with nested towers, unit plans, floor plans
- `lib/uploadUtils.ts` — image upload to Supabase Storage (`builder-assets` bucket)
- `lib/newsStore.ts` — articles CRUD with category/status/publishing

### Email (Resend)
All transactional email goes through `resend.emails.send()` inline in API routes — there is no shared email helper. OTP emails include a signed HMAC token (`businessId|otp|expiresAt`) stored as an httpOnly cookie.

---

## Current Status

_All DB-backed features require their `supabase/migrations/*.sql` to have been run in the Supabase SQL editor — the app does not auto-migrate._

### Completed — identity & accounts
- **Business directory** — full CRUD via admin panel; public listing pages at `/businesses/[id]`
- **Business onboarding** — both self-register and admin-created paths, OTP verification, 24-hour claim tokens, resend OTP/claim, reject with notes
- **My Business dashboard** (`/my-business`) — owner login, profile editing, logo/photo upload via `/api/my-business/media`; tabs for events, offers, news, updates, reviews, now-showing, wellness sessions
- **Individual auth** — `AuthContext` fully wired to Supabase Auth (OTP, email+password, Google OAuth); `user_profiles` + screen name; `updateProfile` / `changePassword` on the context
- **Google OAuth callback** — `app/auth/callback/page.tsx` handles both PKCE and implicit (hash fragment) flows
- **Cross-registration identity** — all three entry points resolve to a single `auth.users` row regardless of order; `resolveOwnerId()` uses `findAuthUserIdByEmail()` (GoTrue Admin REST) to link existing accounts
- **Brokers** — separate broker portal + listings (`app/broker`, `/api/broker`)

### Completed — news & content
- **Articles** — Supabase-backed CRUD with categories (construction / launches / infrastructure / community / **editorial**), draft/publish, admin editor (`ArticleForm`), public `/news` + `/news/[id]`
- **AI news digests** — daily 4 AM Vercel cron generates international/national/state/city digests from fetched headlines (Anthropic `claude-sonnet-4-6`); admin review queue at `/admin/ai-digest` (regenerate-with-feedback, approve/publish)
- **Editor's Desk** — compose articles from editor pointers + headlines (Anthropic); always filed under the **Editorial** category
- **Telugu edition** — path-based `/news/te/[id]` (old `?lang=te` 308-redirects); Google Cloud Translation API v2, cached in `article_translations`; auto-translate at publish + lazy on first view; admin review/edit at `/admin/news/[id]/telugu`; self-hosted Noto Sans Telugu font; hreflang + sitemap entries
- **Cover image generation** — in `ArticleForm`, generate a branded headline card (`next/og`) or an AI editorial illustration (Gemini native image generation), compare candidates and pick; stored in `news-media` bucket
- **News comments + reactions**, **citizen reports** (earn points), **review owner responses**
- **Daily cartoon** — homepage panel, archive, Friday caption contest (`/cartoon`, `/api/cartoons`); admin can also **generate from today's headlines** (`/api/admin/cartoons/generate`) — optionally paste a specific article link and/or notes on the take *before* the first generate (skips the headline pool and fetches+strips that page's text instead), otherwise Claude picks a local Hyderabad RSS headline; either way it writes a title/caption/scene and Gemini illustrates it (comic-strip prompt, distinct from the editorial-illustration one), replacing the old manual "generate in Gemini, download, upload" step; same link/notes fields double as regenerate-with-feedback, same review-before-publish pattern as the AI digest; every cartoon (AI-generated or manually uploaded via `/api/admin/cartoons/upload`) gets a lightweight logo + "neopolis.news" mark baked into the art's corner at generation/upload time (`lib/watermarkCartoon.tsx`); **publishing** a cartoon additionally extends the image with a white caption strip below the art — the punchline plus a more prominent logo + full "https://neopolis.news" lockup, bottom-right (`lib/bakeCartoonText.tsx`) — from a clean `artwork_url` kept alongside `image_url` so unpublish/republish re-bakes fresh instead of stacking text twice; both renderers share font/logo-fetching via `lib/cartoonAssets.ts`, rendered via `next/og` like the headline card rather than sharp+SVG text, since Vercel's serverless runtime has no guaranteed system fonts; `daily_cartoons.view_count`/`whatsapp_share_count` and `articles.views` auto-seed to a randomized odd baseline (300/50/400 respectively) the moment a row is first published, via DB triggers (`20260828_cartoon_publish_effects.sql`) since neither counter is live-tracked — supersedes the earlier one-off seed migrations going forward
- **Daily poll** — admin-created question with 2–6 multiple-choice options (`/admin/polls`), one per `publish_date` like the cartoon; homepage panel + `/polls` archive; sign-in required to vote (one vote per user per poll, changeable via upsert on `(poll_id, user_id)`); results shown as bars once the reader has voted; ⚠️ requires `supabase/migrations/20260826_polls.sql` to be run
- **Sitewide news ticker** above the navbar; homepage news + cartoon strip
- **Brochure import** — admin extracts structured project data from an uploaded brochure (Anthropic)

### Completed — community & engagement
- **Forum** — threads, replies, polls (`/forum`, `/api/forum`)
- **Community clubs** — membership, club events with fee waivers, points, civic impact log (`/clubs`)
- **Points, streaks, badges & public leaderboard** — attendance-verified points for wellness sessions and appointments (`/leaderboard`, `/api/points`)
- **Buyer–seller messaging threads** on property listings (`/api/messages`)
- **Web push notifications** + PWA scaffolding (VAPID; `/api/push`); news publish pushes to the `news` topic
- **Saved properties**, **saved-search email alerts** (Resend, one-click unsubscribe), **site-visit bookings**, **project update subscriptions**

### Completed — real estate & local
- **Builder portal** (`/builder`) — projects, launches, availability, construction updates
- **Project compare** page with sticky bar; expected completion date; lifecycle timeline
- **DB-backed price trends** with admin editor
- **Health directory** + **wellness sessions** (slots, enrollment, attendance); **cinemas / now-showing**; **deals**; **events + spaces**; **business appointments** (booking-link deep-link + request-a-slot)
- **Per-movie showtimes** — `show_times` (time + optional per-time BookMyShow URL, falls back to the movie's own `bms_url`), managed per movie in My Business's Now Showing tab; `/entertainment/cinemas` (filtered by the selected date via `/api/cinemas?date=`) and a cinema's business-profile Now Showing section both show real showtimes as individual Book buttons when entered, falling back to the existing movie- or cinema-level BookMyShow link otherwise; ⚠️ requires `supabase/migrations/20260823_show_times.sql` to be run
- **Ticket-intent click tracking** — every "Book Tickets"/"View Showtimes & Book" click-through to BookMyShow (cinemas page, cinema profile, and now per-showtime) logs to `ticket_click_events` via `/api/ticket-clicks` (public, rate-limited, anonymous), including the exact showtime when known; real (non-simulated) totals shown at the top of `/admin/analytics`; ⚠️ requires `supabase/migrations/20260822_ticket_click_events.sql` to be run
- **Real page-view analytics** — `/admin/analytics` is now fully real (no mock data): a `page_views` row is logged per route change by `PageViewTracker` (mounted in the root layout, skips `/admin/*`) via `/api/track-pageview`, keyed to an anonymous first-party cookie (`nn_vid`, 1-year, not tied to an account); `/api/admin/analytics/page-views` aggregates daily views/visitors, top pages, referrer-bucketed traffic sources (Direct/Search/Social/Referral), and a rough session-duration estimate; ⚠️ requires `supabase/migrations/20260825_page_views.sql` to be run
- **Weather + AQI widget** — Open-Meteo (weather) + WAQI (air quality), client-side; Kokapet coords

### Completed — platform & ops
- **Admin panel** (`/admin`) — businesses, news, AI digest, cartoons, events, payments, analytics, settings; protected client-side by `AdminAuthContext`
- **Server-side auth enforcement** — `middleware.ts` guards `/api/admin/*` (Supabase session via header/cookie + `ADMIN_EMAILS` allowlist)
- **Rate-limiting** on public POST endpoints
- **SEO** — brand-entity + Organization/NewsArticle/Event JSON-LD, dynamic sitemap, robots, per-page metadata
- **Ads** (`/api/ads`) and payments records (Razorpay fields; `/admin/payments`)
- **Business discovery pipeline** (`/admin/business-discovery`) — Google Places search staged for admin review; industry-first config (`lib/businessDiscovery/`, mirrors `TAXONOMY`'s Industry → Type → Subtype shape) with one config file per industry (currently Health & Wellness) sharing a single `business_discovery_candidates` table, run function, and review screen; re-surfaces a candidate on later runs if an already-approved listing's phone/hours/address changed; admin picks industries/types/subtypes (none selected by default; picking an industry selects all its subtypes) plus exactly one locality per run before "Run Discovery Now" enables — capped at 1 locality/run while the feature settles; the monthly cron (`/api/cron/discover-businesses`, full unscoped sweep) is currently **disabled** — removed from `vercel.json`'s `crons`, route left in place to re-enable later; ⚠️ requires `supabase/migrations/20260818_business_discovery.sql` to be run

### AI & external services
| Service | Used for | Env var |
|---|---|---|
| Anthropic (Claude `claude-sonnet-4-6`) | AI digests, Editor's Desk, brochure import | `ANTHROPIC_API_KEY` |
| Google Cloud Translation v2 | Telugu article translation | `GOOGLE_TRANSLATE_API_KEY` |
| Gemini native image generation (`gemini-3.1-flash-image-preview`) | AI editorial illustrations, cartoon generation | `GOOGLE_AI_API_KEY` |
| Google Places API (New) | Monthly business discovery pipeline (`/admin/business-discovery`) | `GOOGLE_PLACES_API_KEY` |
| Open-Meteo + WAQI | Weather + AQI widget | none (WAQI uses a demo token) |

All AI usage is **single-call completions** — no agentic loops, tool use, or Managed Agents.

### Key identity invariant
One `auth.users` record per email/phone, always. `user_profiles` (individual data) and `businesses.owner_id` (owned businesses) both FK to the same `auth.users.id`. Registration order does not matter.

### Not yet implemented / known gaps
- **Business dashboard runs on mock data** — `app/dashboard/business/page.tsx` renders hardcoded `MOCK_CLASSIFIEDS` / `MOCK_RECENT_LEADS`; the real `/api/classifieds` and `/api/leads` exist but aren't wired in
- **Page-level auth guards** — `/api/admin/*` is enforced in middleware, but `/admin`, `/builder`, `/dashboard` **pages** remain client-guarded only (deliberate: sessions live in localStorage)
- **WAQI demo token** — the AQI widget uses `token=demo`; register a real token for production
- **AI-generated image labelling** — editorial AI illustrations are not yet visibly badged as AI on the public article
- **Mobile app** — Expo app scaffolded (`mobile/`: auth, tabs, business/event detail) but far from web parity (no classifieds, forum, clubs, news reading, dashboards)

---

## Known Gotchas

### Next.js data cache causes stale Supabase data on server-rendered pages

`export const dynamic = "force-dynamic"` only sets `fetchCache = 'default-no-store'`, which is not strong enough — Next.js can still serve cached Supabase responses. This caused business profile pages to show a null logo even after the DB was updated.

**Always apply both fixes to any server-rendered page that reads live DB data:**

1. Add to the page file:
```ts
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
```

2. `createAdminClient()` in `lib/supabase/server.ts` already passes `cache: "no-store"` through the global fetch override — do not remove it.

