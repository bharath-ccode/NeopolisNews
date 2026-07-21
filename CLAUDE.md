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

### Completed
- **Business directory** — full CRUD via admin panel; public listing pages at `/businesses/[id]`
- **Business onboarding** — both self-register and admin-created paths, OTP verification, 24-hour claim tokens, resend OTP/claim, reject with notes
- **My Business dashboard** (`/my-business`) — owner login, profile editing, logo/photo upload via `/api/my-business/media`
- **Admin panel** (`/admin`) — business list + detail, news, projects, builders, analytics, settings; protected client-side by `AdminAuthContext`
- **Builder portal** (`/builder`) — project management, launches, availability; protected by `BuilderAuthContext`
- **Individual auth** — `AuthContext` fully wired to Supabase Auth (OTP, email+password, Google OAuth); `user_profiles` table migration at `supabase/migrations/20260417_create_user_profiles.sql` (**must be run in Supabase SQL editor**); `updateProfile` and `changePassword` exposed on the context
- **Google OAuth callback** — `app/auth/callback/page.tsx` handles both PKCE (code exchange) and implicit (hash fragment) flows
- **Individual dashboard** — overview stats and listings pulled from real localStorage data; profile page saves to `user_profiles` via Supabase; property post form saves to localStorage via `lib/listings.ts`
- **Cross-registration identity** — all three entry points (individual signup, business self-register, business claim) resolve to a single `auth.users` row regardless of order; `resolveOwnerId()` in `complete/route.ts` uses `findAuthUserIdByEmail()` (GoTrue Admin REST) to link existing accounts instead of silently setting `owner_id = null`

### Key identity invariant
One `auth.users` record per email/phone, always. `user_profiles` (individual data) and `businesses.owner_id` (owned businesses) both FK to the same `auth.users.id`. Registration order does not matter.

### Not yet implemented
- **Classifieds / Gigs** — designed (post types: For Sale, For Rent, Service Offered, Gig) but no API routes or DB tables yet; property listings use `localStorage` only
- **Enquiries** — enquiries page exists as UI scaffolding with mock data; no DB table or API routes
- **Middleware auth guards** — `middleware.ts` is a pass-through; all route protection is client-side
- **Mobile app** — `auth.users` identity model is ready for a React Native / mobile client; not started

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

