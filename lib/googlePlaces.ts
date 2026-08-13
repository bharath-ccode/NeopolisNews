// Google Places API (New) — Text Search.
// Requires GOOGLE_PLACES_API_KEY (Cloud Console → enable "Places API (New)"
// → create a dedicated API key, restricted to that API → billing must
// already be enabled on the project, same as GOOGLE_TRANSLATE_API_KEY needs).
//
// NOTE: the field names below match Places API (New) as documented at
// build time. Google does evolve this API — if a live call returns an
// unexpected shape, check https://developers.google.com/maps/documentation/places/web-service/text-search
// and adjust PLACE_FIELD_MASK / PlaceResult below to match.
const ENDPOINT = "https://places.googleapis.com/v1/places:searchText";

const PLACE_FIELD_MASK = [
  "places.id",
  "places.displayName",
  "places.formattedAddress",
  "places.nationalPhoneNumber",
  "places.websiteUri",
  "places.regularOpeningHours.weekdayDescriptions",
  "places.rating",
  "places.userRatingCount",
  "places.location",
].join(",");

export interface PlaceResult {
  placeId: string;
  name: string;
  address: string | null;
  phone: string | null;
  website: string | null;
  hoursRaw: string[];
  rating: number | null;
  ratingCount: number | null;
  lat: number | null;
  lng: number | null;
}

interface PlacesApiResponse {
  places?: {
    id: string;
    displayName?: { text?: string };
    formattedAddress?: string;
    nationalPhoneNumber?: string;
    websiteUri?: string;
    regularOpeningHours?: { weekdayDescriptions?: string[] };
    rating?: number;
    userRatingCount?: number;
    location?: { latitude?: number; longitude?: number };
  }[];
}

export interface SearchPlacesOptions {
  maxResults?: number;
  /** Biases (does not hard-restrict) results toward a circle — Places New
   *  has no strict polygon/neighbourhood filter, so this narrows ranking
   *  toward the right area without risking false negatives from an
   *  imprecise center/radius. Pair with an address-text check on the
   *  results for an actual guarantee. */
  locationBias?: { lat: number; lng: number; radiusMeters: number };
}

/** Text-search Places (New), capped at `maxResults` (default 10 — Places
 *  New allows up to 20 per request via pageSize). */
export async function searchPlaces(
  textQuery: string,
  options: SearchPlacesOptions = {}
): Promise<PlaceResult[]> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) throw new Error("GOOGLE_PLACES_API_KEY is not set");

  const body: Record<string, unknown> = { textQuery, pageSize: options.maxResults ?? 10 };
  if (options.locationBias) {
    body.locationBias = {
      circle: {
        center: { latitude: options.locationBias.lat, longitude: options.locationBias.lng },
        radius: options.locationBias.radiusMeters,
      },
    };
  }

  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask": PLACE_FIELD_MASK,
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Google Places ${res.status}: ${body.slice(0, 300)}`);
  }

  const json = (await res.json()) as PlacesApiResponse;
  return (json.places ?? []).map((p) => ({
    placeId: p.id,
    name: p.displayName?.text ?? "Unnamed",
    address: p.formattedAddress ?? null,
    phone: p.nationalPhoneNumber ?? null,
    website: p.websiteUri ?? null,
    hoursRaw: p.regularOpeningHours?.weekdayDescriptions ?? [],
    rating: p.rating ?? null,
    ratingCount: p.userRatingCount ?? null,
    lat: p.location?.latitude ?? null,
    lng: p.location?.longitude ?? null,
  }));
}
