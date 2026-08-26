export type TrafficAreaId = "neopolis" | "financial-district";

export interface TrafficArea {
  id: TrafficAreaId;
  label: string;
  sublabel: string;
  /** Short, human-readable description of the reference drive this area's
   *  reading is based on — shown in the widget so "11 min" reads as "11 min
   *  on this specific stretch," not a district-wide index. */
  routeLabel: string;
  /** Address-based waypoints — let Google's own geocoding resolve these
   *  rather than hardcoding lat/lng we can't verify precisely. */
  origin: string;
  destination: string;
}

export const TRAFFIC_AREAS: TrafficArea[] = [
  {
    id: "neopolis",
    label: "Neopolis",
    sublabel: "Kokapet, Narsingi, Gandipet",
    routeLabel: "Kokapet → Gandipet",
    origin: "Kokapet, Hyderabad, Telangana, India",
    destination: "Gandipet, Hyderabad, Telangana, India",
  },
  {
    id: "financial-district",
    label: "Financial District",
    sublabel: "Nanakramguda, ISB Road",
    routeLabel: "Nanakramguda → ISB Road",
    origin: "Nanakramguda, Hyderabad, Telangana, India",
    destination: "Indian School of Business, Hyderabad, Telangana, India",
  },
];
