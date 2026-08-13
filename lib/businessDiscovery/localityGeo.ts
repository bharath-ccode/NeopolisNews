import type { Locality } from "@/lib/projectsStore";

interface LocalityGeo {
  lat: number;
  lng: number;
  radiusMeters: number;
}

/** Centers used only to bias Places Text Search toward the right
 *  neighbourhood (see searchPlaces' locationBias) — a wrong/imprecise
 *  center here can make results skew slightly off but can never wrongly
 *  exclude a real match, since it's a bias, not a hard filter. The actual
 *  guarantee that e.g. a Kokapet search doesn't return Manikonda results
 *  is the address-text check in run.ts, which needs no coordinates at all.
 *
 *  Neopolis, Khanapur, and Mokila coordinates are user-supplied; the rest
 *  are best-effort from public locality data, not surveyed. Spot-check
 *  on a map and tighten `radiusMeters` if a locality still pulls in a
 *  lot of neighbouring-area noise. */
export const LOCALITY_GEO: Partial<Record<Locality, LocalityGeo>> = {
  "Neopolis":           { lat: 17.403778023187314, lng: 78.31477110746185, radiusMeters: 2500 },
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
  "Khanapur":           { lat: 17.40029195959356, lng: 78.30113250143417, radiusMeters: 2500 },
  "Mokila":             { lat: 17.43294141991342, lng: 78.18806908678228, radiusMeters: 3500 },
};
