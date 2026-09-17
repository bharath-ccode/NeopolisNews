import { searchPlaces } from "@/lib/googlePlaces";
import { createAdminClient } from "@/lib/supabase/server";

export interface PlaceMatch {
  placeId: string;
  placeName: string;
  placeAddress: string | null;
  existingBusiness: { id: string; name: string; owner_id: string | null } | null;
}

/** Best-effort: resolves the Google place_id for a name+address, then
 *  checks whether a business already exists in our DB under that same
 *  place_id — the shared dedupe key between Google-sourced discovery and
 *  direct registration (self-register, admin-created, or admin's
 *  search-by-name tool). Never throws; a lookup failure returns null so it
 *  never blocks registration, same "best-effort" treatment as
 *  lib/googleGeocode.ts. */
export async function findPlaceMatch(name: string, address: string): Promise<PlaceMatch | null> {
  try {
    const results = await searchPlaces(`${name}, ${address}`, { maxResults: 1 });
    const top = results[0];
    if (!top) return null;

    const admin = createAdminClient();
    const { data } = await admin
      .from("businesses")
      .select("id, name, owner_id")
      .eq("place_id", top.placeId)
      .maybeSingle();

    return { placeId: top.placeId, placeName: top.name, placeAddress: top.address, existingBusiness: data ?? null };
  } catch (err) {
    console.error("findPlaceMatch:", err);
    return null;
  }
}
