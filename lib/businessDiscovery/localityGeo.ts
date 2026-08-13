import type { Locality } from "@/lib/projectsStore";

interface LocalityGeo {
  lat: number;
  lng: number;
  radiusMeters: number;
}

/** Approximate centers used only to bias Places Text Search toward the
 *  right neighbourhood (see searchPlaces' locationBias) — best-effort,
 *  sourced from public locality data, not surveyed. A wrong/imprecise
 *  center here can make results skew slightly off but can never wrongly
 *  exclude a real match, since it's a bias, not a hard filter. The actual
 *  guarantee that e.g. a Kokapet search doesn't return Manikonda results
 *  is the address-text check in run.ts, which needs no coordinates at all.
 *
 *  "Neopolis", "Khanapur" (there are several same-named villages in the
 *  district; this is the one in Gandipet mandal), and "Mokilla" have too
 *  little reliable public geodata to bias confidently — omitted, so
 *  search just relies on the address-text filter for those three. Spot-
 *  check the rest on a map if a locality still pulls in a lot of
 *  neighbouring-area noise; these are starting points, not verified
 *  survey coordinates. */
export const LOCALITY_GEO: Partial<Record<Locality, LocalityGeo>> = {
  "Kokapet":            { lat: 17.3956, lng: 78.3347, radiusMeters: 3000 },
  "Gandipet":           { lat: 17.3980, lng: 78.3100, radiusMeters: 4000 },
  "Financial District": { lat: 17.4108, lng: 78.3416, radiusMeters: 2500 },
  "Nanakramguda":       { lat: 17.4108, lng: 78.3416, radiusMeters: 2500 },
  "Rajendranagar":      { lat: 17.3349, lng: 78.4086, radiusMeters: 5000 },
  "Nallagandla":        { lat: 17.4697, lng: 78.3156, radiusMeters: 3000 },
  "Tellapur":           { lat: 17.4682, lng: 78.2847, radiusMeters: 3000 },
  "Puppalaguda":        { lat: 17.4000, lng: 78.3830, radiusMeters: 2000 },
  "Narsingi":           { lat: 17.3876, lng: 78.3570, radiusMeters: 3000 },
  "Gachibowli":         { lat: 17.4372, lng: 78.3444, radiusMeters: 3500 },
  "Velimala":           { lat: 17.4786, lng: 78.2482, radiusMeters: 4000 },
  "Kollur":             { lat: 17.4786, lng: 78.2482, radiusMeters: 4000 },
  "Vattinagulapally":   { lat: 17.4188, lng: 78.2924, radiusMeters: 2500 },
  "Janwada":            { lat: 17.3600, lng: 78.2850, radiusMeters: 4000 },
};
