import { createAdminClient } from "@/lib/supabase/server";
import type { DayTiming } from "@/lib/businessStore";
import { parseGoogleHours } from "./run";

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
 *  already-live business) the businesses row — filed under whichever
 *  industry/type/subtype the candidate was discovered under — and marks
 *  the candidate approved + linked. Lands as status "active" (not the
 *  "invited"/claim-pending status Path A/B onboarding uses) so it's
 *  publicly searchable immediately; nobody owns it yet, so the business
 *  profile shows a "Claim this business" prompt until an owner does. */
export async function promoteCandidateToBusiness(
  candidateId: string,
  overrides: PromoteOverrides,
  reviewedBy: string
): Promise<{ businessId: string }> {
  const sb = createAdminClient();
  const { data: candidate, error } = await sb
    .from("business_discovery_candidates")
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
  // Places already gave us this for free at discovery time — carry it
  // forward so listing pages can show distance without a geocoding call.
  const latitude = candidate.lat ?? null;
  const longitude = candidate.lng ?? null;

  let businessId = candidate.promoted_business_id as string | null;

  if (businessId) {
    await sb.from("businesses").update({
      name, address, contact_phone: phone, email, website, timings, latitude, longitude,
    }).eq("id", businessId);
  } else {
    businessId = randomBusinessId();
    await sb.from("businesses").insert({
      id: businessId,
      name,
      industry: candidate.industry,
      types: [candidate.business_type],
      subtypes: [candidate.subtype],
      address,
      status: "active",
      verified: false,
      contact_phone: phone,
      email,
      website,
      timings,
      latitude,
      longitude,
      created_at: new Date().toISOString(),
    });
  }

  await sb.from("business_discovery_candidates").update({
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
  await sb.from("business_discovery_candidates").update({
    status: "rejected",
    reviewed_at: new Date().toISOString(),
    reviewed_by: reviewedBy,
    change_summary: null,
  }).eq("id", candidateId);
}
