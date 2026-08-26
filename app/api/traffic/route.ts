import { NextRequest, NextResponse } from "next/server";
import { TRAFFIC_AREAS, type TrafficAreaId } from "@/lib/trafficAreas";

export const dynamic = "force-dynamic";

// Google Routes API — current recommended traffic-aware directions endpoint
// (successor to the legacy Distance Matrix API). Needs the "Routes API"
// enabled + billing on the Google Cloud project GOOGLE_MAPS_API_KEY belongs
// to (can be the same project already used for Places, just enable the
// extra API and make sure the key isn't restricted away from it).
const ROUTES_ENDPOINT = "https://routes.googleapis.com/directions/v2:computeRoutes";

function parseSeconds(value: string | undefined): number {
  if (!value) return 0;
  return parseInt(value.replace("s", ""), 10) || 0;
}

function levelFor(ratio: number, delayMinutes: number): "light" | "moderate" | "heavy" {
  if (delayMinutes < 2) return "light";
  if (ratio < 1.15) return "light";
  if (ratio < 1.4) return "moderate";
  return "heavy";
}

/** GET ?area=neopolis|financial-district — current drive time vs typical
 *  (free-flow) drive time along one representative stretch through the
 *  area, used to derive a light/moderate/heavy summary. Not a full traffic
 *  map — a single-route proxy, same spirit as a weather station reading
 *  standing in for a whole district. */
export async function GET(req: NextRequest) {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "GOOGLE_MAPS_API_KEY is not configured" }, { status: 500 });
  }

  const areaId = (req.nextUrl.searchParams.get("area") ?? "neopolis") as TrafficAreaId;
  const area = TRAFFIC_AREAS.find((a) => a.id === areaId);
  if (!area) {
    return NextResponse.json({ error: "Unknown area" }, { status: 400 });
  }

  try {
    const res = await fetch(ROUTES_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": "routes.duration,routes.staticDuration,routes.distanceMeters",
      },
      body: JSON.stringify({
        origin: { address: area.origin },
        destination: { address: area.destination },
        travelMode: "DRIVE",
        routingPreference: "TRAFFIC_AWARE",
        computeAlternativeRoutes: false,
        languageCode: "en-US",
        units: "METRIC",
      }),
      // Traffic conditions don't need a fresh billed call on every page
      // load — cache each area's reading for 5 minutes.
      next: { revalidate: 300 },
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      console.error("traffic: routes api error:", res.status, detail.slice(0, 300));
      return NextResponse.json({ error: "Traffic data unavailable" }, { status: 502 });
    }

    const json = (await res.json()) as {
      routes?: { duration?: string; staticDuration?: string; distanceMeters?: number }[];
    };
    const route = json.routes?.[0];
    if (!route) {
      return NextResponse.json({ error: "No route found" }, { status: 502 });
    }

    const currentSeconds = parseSeconds(route.duration);
    const typicalSeconds = parseSeconds(route.staticDuration) || currentSeconds;
    const currentMinutes = Math.max(1, Math.round(currentSeconds / 60));
    const typicalMinutes = Math.max(1, Math.round(typicalSeconds / 60));
    const delayMinutes = Math.max(0, currentMinutes - typicalMinutes);
    const ratio = typicalSeconds > 0 ? currentSeconds / typicalSeconds : 1;

    return NextResponse.json({
      area: area.id,
      label: area.label,
      sublabel: area.sublabel,
      level: levelFor(ratio, delayMinutes),
      currentMinutes,
      typicalMinutes,
      delayMinutes,
      distanceKm: route.distanceMeters ? Math.round((route.distanceMeters / 1000) * 10) / 10 : null,
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error("traffic:", err);
    return NextResponse.json({ error: "Traffic data unavailable" }, { status: 502 });
  }
}
