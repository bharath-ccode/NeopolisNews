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
 *  profile shows a "Claim this business" prompt until an owner does.
 *
 *  Cross-channel dedupe: a business can reach place_id equality two ways —
 *  either this exact candidate was promoted before (promoted_business_id
 *  already set), or a *different* business row already exists with this
 *  place_id because it was onboarded directly (self-register or
 *  admin-created) before Google ever surfaced it in discovery. Either way,
 *  link to that existing row instead of inserting a duplicate. In the
 *  second case the existing row may already carry real, owner-entered
 *  content (it could even be claimed), so only blank fields are filled in
 *  from the candidate — nothing already set gets overwritten. */
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

  // Not linked via this candidate before — check whether a directly
  // onboarded business already claimed this place_id first.
  let existingByPlaceId: Record<string, unknown> | null = null;
  if (!businessId && candidate.place_id) {
    const { data } = await sb
      .from("businesses")
      .select("*")
      .eq("place_id", candidate.place_id)
      .maybeSingle();
    existingByPlaceId = data;
  }

  if (businessId) {
    await sb.from("businesses").update({
      name, address, contact_phone: phone, email, website, timings, latitude, longitude,
      place_id: candidate.place_id,
    }).eq("id", businessId);
  } else if (existingByPlaceId) {
    businessId = existingByPlaceId.id as string;
    const fill: Record<string, unknown> = {};
    if (!existingByPlaceId.contact_phone) fill.contact_phone = phone;
    if (!existingByPlaceId.email)         fill.email = email;
    if (!existingByPlaceId.website)       fill.website = website;
    if (!existingByPlaceId.latitude)      fill.latitude = latitude;
    if (!existingByPlaceId.longitude)     fill.longitude = longitude;
    if (!existingByPlaceId.timings || (existingByPlaceId.timings as unknown[]).length === 0) fill.timings = timings;
    if (Object.keys(fill).length > 0) {
      await sb.from("businesses").update(fill).eq("id", businessId);
    }
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
      place_id: candidate.place_id,
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
