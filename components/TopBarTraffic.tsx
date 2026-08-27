"use client";

import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import { TRAFFIC_AREAS, type TrafficAreaId } from "@/lib/trafficAreas";

interface TrafficResult {
  level: "light" | "moderate" | "heavy";
  currentMinutes: number;
}

const DOT: Record<TrafficResult["level"], string> = {
  light: "bg-green-400",
  moderate: "bg-amber-400",
  heavy: "bg-red-400",
};

/** Sitewide top-bar traffic chip, right next to WeatherWidget — same "quick
 *  glance, every page, no scroll" prominence as weather. The fuller card
 *  with drive-time context still lives on the homepage
 *  (HomeTrafficWidget); this is deliberately compact. Hidden below md — the
 *  top bar is already tight on mobile with just weather. */
export default function TopBarTraffic() {
  const [areaId, setAreaId] = useState<TrafficAreaId>("neopolis");
  const [data, setData]     = useState<TrafficResult | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/traffic?area=${areaId}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => { if (!cancelled) setData(j); })
      .catch(() => { if (!cancelled) setData(null); });
    return () => { cancelled = true; };
  }, [areaId]);

  return (
    <div className="hidden md:flex items-center gap-1.5 pl-4 ml-4 border-l border-brand-800">
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${data ? DOT[data.level] : "bg-brand-700"}`} />
      <div className="relative flex items-center">
        <select
          value={areaId}
          onChange={(e) => setAreaId(e.target.value as TrafficAreaId)}
          aria-label="Traffic area"
          className="appearance-none bg-transparent text-brand-200 hover:text-white text-xs pr-3.5 focus:outline-none cursor-pointer"
        >
          {TRAFFIC_AREAS.map((a) => (
            <option key={a.id} value={a.id}>{a.label}</option>
          ))}
        </select>
        <ChevronDown className="w-2.5 h-2.5 text-brand-400 absolute right-0 pointer-events-none" />
      </div>
      {data && <span className="text-brand-300">{data.currentMinutes} min</span>}
    </div>
  );
}
