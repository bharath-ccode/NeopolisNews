// Google Geocoding API — turns a free-text address into lat/lng. Used
// whenever a business is added directly on the site (self-register,
// admin-created) rather than sourced from Places search, which already
// returns coordinates for free. Reuses GOOGLE_PLACES_API_KEY — just enable
// "Geocoding API" on the same Cloud project that key already has Places
// API (New) enabled on.
const ENDPOINT = "https://maps.googleapis.com/maps/api/geocode/json";

export interface GeocodeResult {
  lat: number;
  lng: number;
}

/** Best-effort — returns null on any failure (missing key, bad address,
 *  network error) rather than throwing, since a business should still get
 *  created even if geocoding fails. */
export async function geocodeAddress(address: string): Promise<GeocodeResult | null> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey || !address?.trim()) return null;

  try {
    const url = `${ENDPOINT}?address=${encodeURIComponent(address)}&key=${apiKey}`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return null;

    const json = (await res.json()) as {
      status: string;
      results?: { geometry?: { location?: { lat: number; lng: number } } }[];
    };
    if (json.status !== "OK") {
      console.error("geocodeAddress:", json.status);
      return null;
    }
    const location = json.results?.[0]?.geometry?.location;
    if (!location) return null;
    return { lat: location.lat, lng: location.lng };
  } catch (err) {
    console.error("geocodeAddress:", err);
    return null;
  }
}
