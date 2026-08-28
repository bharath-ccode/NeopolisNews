import { createAdminClient } from "@/lib/supabase/server";
import { searchPlaces, type PlaceResult } from "@/lib/googlePlaces";
import { promoteCandidateToBusiness } from "./promote";

/** Ad-hoc "search by name" — a plain Places text search with no locality/
 *  address filtering, since the admin already knows exactly which
 *  business they're looking for and is picking it out of the results by
 *  eye, not sweeping a category. Nothing here is persisted; only the one
 *  result the admin picks (via addDiscoveredBusiness) gets saved. */
export async function searchByName(name: string): Promise<PlaceResult[]> {
  return searchPlaces(name);
}

/** Adds the one place an admin picked out of a name search straight to
 *  businesses — skips the pending-review queue, since picking it out of
 *  a name search *is* the review. Still writes a business_discovery_
 *  candidates row (status starts 'pending' then promote() flips it to
 *  'approved') so it dedupes against place_id like every other candidate
 *  and shows up in the Approved tab for a record of how it was added. */
export async function addDiscoveredBusiness(
  place: PlaceResult,
  industry: string,
  type: string,
  subtype: string,
  reviewedBy: string
): Promise<{ businessId: string }> {
  const sb = createAdminClient();

  const { data: existing } = await sb
    .from("business_discovery_candidates")
    .select("id")
    .eq("place_id", place.placeId)
    .maybeSingle<{ id: string }>();

  const fields = {
    name: place.name,
    industry,
    business_type: type,
    subtype,
    address: place.address,
    phone: place.phone,
    website: place.website,
    hours_raw: place.hoursRaw,
    rating: place.rating,
    rating_count: place.ratingCount,
    lat: place.lat,
    lng: place.lng,
    last_seen_at: new Date().toISOString(),
  };

  let candidateId: string;
  if (existing) {
    candidateId = existing.id;
    await sb.from("business_discovery_candidates").update(fields).eq("id", candidateId);
  } else {
    const { data: inserted, error } = await sb
      .from("business_discovery_candidates")
      .insert({
        ...fields,
        place_id: place.placeId,
        locality: "Manual",
        search_query: `manual: ${place.name}`,
        status: "pending",
      })
      .select("id")
      .single();
    if (error || !inserted) throw new Error(error?.message ?? "Failed to save candidate");
    candidateId = inserted.id;
  }

  return promoteCandidateToBusiness(candidateId, {}, reviewedBy);
}
