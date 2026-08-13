import { createAdminClient } from "@/lib/supabase/server";
import { searchPlaces, type PlaceResult } from "@/lib/googlePlaces";
import { HEALTH_DISCOVERY_TARGETS, DISCOVERY_LOCALITIES, buildQuery, type DiscoveryTarget } from "@/lib/healthDiscoveryConfig";
import { DEFAULT_TIMINGS, type DayTiming } from "@/lib/businessStore";
import type { Locality } from "@/lib/projectsStore";

// ─── Hours parsing ────────────────────────────────────────────────────────────

const DAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

function to24Hour(token: string): string | null {
  const m = token.trim().match(/^(\d{1,2}):(\d{2})\s*([AP]M)$/i);
  if (!m) return null;
  let h = parseInt(m[1], 10);
  const mins = m[2];
  const isPM = m[3].toUpperCase() === "PM";
  if (isPM && h !== 12) h += 12;
  if (!isPM && h === 12) h = 0;
  return `${String(h).padStart(2, "0")}:${mins}`;
}

/** Best-effort parse of Google's weekdayDescriptions ("Monday: 9:00 AM – 6:00 PM",
 *  "Sunday: Closed") into the app's DayTiming[]. Falls back to DEFAULT_TIMINGS
 *  for any day it can't confidently parse — the admin review screen shows the
 *  raw Google text alongside, so a bad guess here is always visible/fixable. */
export function parseGoogleHours(raw: string[]): DayTiming[] {
  if (!raw.length) return DEFAULT_TIMINGS;

  const byDay = new Map<string, string>();
  for (const line of raw) {
    const idx = line.indexOf(":");
    if (idx === -1) continue;
    const day = line.slice(0, idx).trim();
    const rest = line.slice(idx + 1).trim();
    if (DAY_NAMES.includes(day)) byDay.set(day, rest);
  }

  return DAY_NAMES.map((day) => {
    const fallback = DEFAULT_TIMINGS.find((d) => d.day === day)!;
    const text = byDay.get(day);
    if (!text) return fallback;

    if (/closed/i.test(text)) {
      return { day, open: fallback.open, close: fallback.close, closed: true };
    }
    // Only the first range if the day has a split shift (e.g. lunch break) —
    // good enough for a directory listing; admin can refine in review.
    const range = text.split(",")[0];
    const parts = range.split(/[–-]/).map((s) => s.trim());
    if (parts.length !== 2) return fallback;
    const open = to24Hour(parts[0]);
    const close = to24Hour(parts[1]);
    if (!open || !close) return fallback;
    return { day, open, close, closed: false };
  });
}

// ─── Change detection ─────────────────────────────────────────────────────────

interface CandidateRow {
  id: string;
  place_id: string;
  status: string;
  name: string;
  address: string | null;
  phone: string | null;
  website: string | null;
  hours_raw: string[];
  promoted_business_id: string | null;
}

function diffFields(existing: CandidateRow, fresh: PlaceResult): string[] {
  const changes: string[] = [];
  if (existing.name !== fresh.name) changes.push("name");
  if ((existing.phone ?? "") !== (fresh.phone ?? "")) changes.push("phone");
  if ((existing.address ?? "") !== (fresh.address ?? "")) changes.push("address");
  if (JSON.stringify(existing.hours_raw ?? []) !== JSON.stringify(fresh.hoursRaw)) changes.push("hours");
  return changes;
}

// ─── Run ──────────────────────────────────────────────────────────────────────

export interface DiscoveryRunSummary {
  queried: number;
  newCandidates: number;
  changedCandidates: number;
  errors: string[];
}

/** Searches every locality x target combination, upserts results into
 *  health_business_candidates. New places land as 'pending'. A place that
 *  was already approved (live in businesses) and whose phone/address/hours
 *  changed is flipped back to 'pending' with a change_summary so it
 *  resurfaces for review — an unchanged approved place is left alone. A
 *  rejected place stays rejected unless its details changed since. */
export async function runHealthDiscovery(): Promise<DiscoveryRunSummary> {
  const sb = createAdminClient();
  const summary: DiscoveryRunSummary = { queried: 0, newCandidates: 0, changedCandidates: 0, errors: [] };

  for (const locality of DISCOVERY_LOCALITIES as Locality[]) {
    for (const target of HEALTH_DISCOVERY_TARGETS as DiscoveryTarget[]) {
      const query = buildQuery(target, locality);
      summary.queried++;

      let places: PlaceResult[];
      try {
        places = await searchPlaces(query);
      } catch (err) {
        summary.errors.push(`${query}: ${err instanceof Error ? err.message : String(err)}`);
        continue;
      }

      for (const place of places) {
        const { data: existing } = await sb
          .from("health_business_candidates")
          .select("id, place_id, status, name, address, phone, website, hours_raw, promoted_business_id")
          .eq("place_id", place.placeId)
          .maybeSingle<CandidateRow>();

        if (!existing) {
          await sb.from("health_business_candidates").insert({
            place_id: place.placeId,
            name: place.name,
            business_type: target.businessType,
            subtype: target.subtype,
            locality,
            search_query: query,
            address: place.address,
            phone: place.phone,
            website: place.website,
            hours_raw: place.hoursRaw,
            rating: place.rating,
            rating_count: place.ratingCount,
            lat: place.lat,
            lng: place.lng,
            status: "pending",
          });
          summary.newCandidates++;
          continue;
        }

        const changes = diffFields(existing, place);
        const patch = {
          name: place.name,
          address: place.address,
          phone: place.phone,
          website: place.website,
          hours_raw: place.hoursRaw,
          rating: place.rating,
          rating_count: place.ratingCount,
          lat: place.lat,
          lng: place.lng,
          last_seen_at: new Date().toISOString(),
          ...(changes.length && existing.status !== "pending"
            ? { status: "pending", change_summary: `Changed since last review: ${changes.join(", ")}` }
            : {}),
        };
        await sb.from("health_business_candidates").update(patch).eq("id", existing.id);
        if (changes.length && existing.status !== "pending") summary.changedCandidates++;
      }
    }
  }

  return summary;
}

// ─── Promotion into the live directory ────────────────────────────────────────

function randomBusinessId(): string {
  return Math.random().toString(36).slice(2, 10).toUpperCase();
}

export interface PromoteOverrides {
  name?: string;
  phone?: string;
  email?: string;
  address?: string;
  website?: string;
  timings?: DayTiming[];
}

/** Approve a candidate: creates (or updates, if this is a re-surfaced
 *  already-live business) the businesses row, and marks the candidate
 *  approved + linked. */
export async function promoteCandidateToBusiness(
  candidateId: string,
  overrides: PromoteOverrides,
  reviewedBy: string
): Promise<{ businessId: string }> {
  const sb = createAdminClient();
  const { data: candidate, error } = await sb
    .from("health_business_candidates")
    .select("*")
    .eq("id", candidateId)
    .single();
  if (error || !candidate) throw new Error("Candidate not found");

  const name = overrides.name ?? candidate.name;
  const address = overrides.address ?? candidate.address;
  const phone = overrides.phone ?? candidate.phone;
  const email = overrides.email ?? candidate.email ?? null;
  const website = overrides.website ?? candidate.website;
  const timings = overrides.timings ?? parseGoogleHours(candidate.hours_raw ?? []);

  let businessId = candidate.promoted_business_id as string | null;

  if (businessId) {
    await sb.from("businesses").update({
      name, address, contact_phone: phone, email, website, timings,
    }).eq("id", businessId);
  } else {
    businessId = randomBusinessId();
    await sb.from("businesses").insert({
      id: businessId,
      name,
      industry: "Health & Wellness",
      types: [candidate.business_type],
      subtypes: [candidate.subtype],
      address,
      status: "invited",
      verified: false,
      contact_phone: phone,
      email,
      website,
      timings,
      created_at: new Date().toISOString(),
    });
  }

  await sb.from("health_business_candidates").update({
    status: "approved",
    promoted_business_id: businessId,
    reviewed_at: new Date().toISOString(),
    reviewed_by: reviewedBy,
    change_summary: null,
  }).eq("id", candidateId);

  return { businessId };
}

export async function rejectCandidate(candidateId: string, reviewedBy: string): Promise<void> {
  const sb = createAdminClient();
  await sb.from("health_business_candidates").update({
    status: "rejected",
    reviewed_at: new Date().toISOString(),
    reviewed_by: reviewedBy,
    change_summary: null,
  }).eq("id", candidateId);
}
