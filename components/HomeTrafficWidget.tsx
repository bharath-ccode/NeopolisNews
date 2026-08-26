"use client";

import { useEffect, useState } from "react";
import { Car, ChevronDown, Clock } from "lucide-react";
import { TRAFFIC_AREAS, type TrafficAreaId } from "@/lib/trafficAreas";

interface TrafficResult {
  level: "light" | "moderate" | "heavy";
  currentMinutes: number;
  typicalMinutes: number;
  delayMinutes: number;
}

const LEVEL_META: Record<TrafficResult["level"], { label: string; dot: string; text: string; bg: string }> = {
  light:    { label: "Light traffic",    dot: "bg-green-500", text: "text-green-700", bg: "bg-green-50 border-green-200" },
  moderate: { label: "Moderate traffic", dot: "bg-amber-500", text: "text-amber-700", bg: "bg-amber-50 border-amber-200" },
  heavy:    { label: "Heavy traffic",    dot: "bg-red-500",   text: "text-red-700",   bg: "bg-red-50 border-red-200" },
};

/** Homepage "live traffic" card — a drive-time reading for a representative
 *  stretch through the selected area, refreshed on selection. Same "quick
 *  glance, brings you back" spirit as the navbar weather/AQI widget. */
export default function HomeTrafficWidget() {
  const [areaId, setAreaId]   = useState<TrafficAreaId>("neopolis");
  const [data, setData]       = useState<TrafficResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);
    fetch(`/api/traffic?area=${areaId}`)
      .then((r) => { if (!r.ok) throw new Error("bad response"); return r.json(); })
      .then((j) => { if (!cancelled) setData(j); })
      .catch(() => { if (!cancelled) setError(true); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [areaId]);

  const meta = data ? LEVEL_META[data.level] : null;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center shrink-0">
          <Car className="w-5 h-5 text-brand-600" />
        </div>
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Live Traffic</p>
          <div className="relative inline-block mt-0.5">
            <select
              value={areaId}
              onChange={(e) => setAreaId(e.target.value as TrafficAreaId)}
              className="appearance-none bg-transparent font-bold text-gray-900 text-sm pr-5 focus:outline-none cursor-pointer"
            >
              {TRAFFIC_AREAS.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.label} — {a.sublabel}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      <div className="sm:ml-auto flex items-center gap-3">
        {loading ? (
          <span className="text-xs text-gray-400">Checking live traffic…</span>
        ) : error || !data || !meta ? (
          <span className="text-xs text-gray-400">Traffic data unavailable right now</span>
        ) : (
          <>
            <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full border ${meta.bg} ${meta.text}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
              {meta.label}
            </span>
            <span className="text-sm text-gray-600 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-gray-400" />
              {data.currentMinutes} min
              {data.delayMinutes > 1 && <span className="text-gray-400">(usually {data.typicalMinutes})</span>}
            </span>
          </>
        )}
      </div>
    </div>
  );
}
