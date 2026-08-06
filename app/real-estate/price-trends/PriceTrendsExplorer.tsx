"use client";

import { useMemo, useRef, useState } from "react";
import { MapPin } from "lucide-react";
import type { Locality, ProjectTier, LifecycleStatus } from "@/lib/projectsStore";

export interface StageSeriesData {
  stage: LifecycleStatus;
  points: { month: string; price: number }[]; // ascending by month
}
export interface TierGroupData {
  tier: ProjectTier;
  stages: StageSeriesData[];
}
export interface LocalityGroupData {
  locality: Locality;
  tiers: TierGroupData[];
}

const TIER_LABELS: Record<ProjectTier, string> = {
  affordable:  "Affordable",
  premium:     "Premium",
  luxury:      "Luxury",
  uber_luxury: "Uber Luxury",
};

const STAGE_LABELS: Record<LifecycleStatus, string> = {
  pre_launch:         "Pre-Launch",
  rera_registered:    "RERA Registered",
  under_construction: "Under Construction",
  structure_complete: "Structure Complete",
  finishing:          "Finishing",
  oc_received:        "OC Received",
  ready_to_move:      "Ready to Move",
};

// Ordinal ramp, light -> dark = earliest -> most-complete stage (same
// direction as cheap -> expensive). Vivid azure, validated for lightness
// monotonicity, CVD separation, and surface contrast (light-end 2.24:1 vs
// white — clears the ordinal floor).
const STAGE_COLOR: Record<LifecycleStatus, string> = {
  pre_launch:         "#5CB3ED",
  rera_registered:    "#5CB3ED",
  under_construction: "#3B9AE3",
  structure_complete: "#2481D4",
  finishing:          "#1868B8",
  oc_received:        "#124F94",
  ready_to_move:      "#0B3A72",
};

function fmtMonth(month: string): string {
  return new Date(month + "T00:00:00").toLocaleDateString("en-IN", { month: "short", year: "numeric" });
}
function fmtMonthShort(month: string): string {
  return new Date(month + "T00:00:00").toLocaleDateString("en-IN", { month: "short" }) +
    "'" + new Date(month + "T00:00:00").getFullYear().toString().slice(-2);
}
function fmtPrice(n: number): string {
  return "₹" + n.toLocaleString("en-IN");
}

// ─── Multi-line chart: one line per construction stage ──────────────────────

function StageTrendChart({ stages }: { stages: StageSeriesData[] }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  const chartable = stages.filter((s) => s.points.length >= 2);
  const months = useMemo(() => {
    const set = new Set<string>();
    chartable.forEach((s) => s.points.forEach((p) => set.add(p.month)));
    return Array.from(set).sort();
  }, [chartable]);

  if (chartable.length === 0 || months.length < 2) {
    return (
      <p className="text-sm text-gray-400 py-10 text-center">
        History will appear here after next month&apos;s update.
      </p>
    );
  }

  const W = 860, H = 300, padL = 56, padR = 16, padT = 12, padB = 30;
  const plotW = W - padL - padR, plotH = H - padT - padB;

  const priceAt = (stage: StageSeriesData, month: string) =>
    stage.points.find((p) => p.month === month)?.price ?? null;

  const allPrices = chartable.flatMap((s) => s.points.map((p) => p.price));
  let minP = Math.min(...allPrices), maxP = Math.max(...allPrices);
  const pad = (maxP - minP) * 0.1 || minP * 0.05;
  minP -= pad; maxP += pad;

  const x = (i: number) => padL + (i / (months.length - 1)) * plotW;
  const y = (v: number) => padT + plotH - ((v - minP) / (maxP - minP)) * plotH;

  function handleMove(e: React.MouseEvent<SVGSVGElement>) {
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const mx = ((e.clientX - rect.left) / rect.width) * W;
    let idx = Math.round(((mx - padL) / plotW) * (months.length - 1));
    idx = Math.max(0, Math.min(months.length - 1, idx));
    setHoverIdx(idx);
  }

  const gridSteps = 4;

  return (
    <div className="relative">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        className="w-full h-auto"
        onMouseMove={handleMove}
        onMouseLeave={() => setHoverIdx(null)}
      >
        <defs>
          <linearGradient id="plotWash" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#EAF3FD" />
            <stop offset="100%" stopColor="#F8FBFF" />
          </linearGradient>
        </defs>
        <rect x={padL} y={padT} width={plotW} height={plotH} fill="url(#plotWash)" rx={6} />
        {Array.from({ length: gridSteps + 1 }).map((_, g) => {
          const v = minP + (g / gridSteps) * (maxP - minP);
          const yy = y(v);
          return (
            <g key={g}>
              <line x1={padL} x2={W - padR} y1={yy} y2={yy} stroke="#CBDCF2" strokeWidth={1} />
              <text x={padL - 8} y={yy + 4} textAnchor="end" fontSize={10} fill="#6B84A3" fontFamily="ui-monospace, monospace">
                ₹{Math.round(v).toLocaleString("en-IN")}
              </text>
            </g>
          );
        })}
        {months.map((m, i) =>
          i % Math.ceil(months.length / 8) === 0 || i === months.length - 1 ? (
            <text key={m} x={x(i)} y={H - 8} textAnchor="middle" fontSize={10} fill="#6B84A3" fontFamily="ui-monospace, monospace">
              {fmtMonthShort(m)}
            </text>
          ) : null
        )}

        {chartable.map((s) => {
          let d = "";
          let started = false;
          months.forEach((m, i) => {
            const price = priceAt(s, m);
            if (price === null) return;
            d += (started ? "L" : "M") + x(i).toFixed(1) + "," + y(price).toFixed(1) + " ";
            started = true;
          });
          return <path key={s.stage} d={d} fill="none" stroke={STAGE_COLOR[s.stage]} strokeWidth={2} />;
        })}

        {hoverIdx !== null && (
          <line x1={x(hoverIdx)} x2={x(hoverIdx)} y1={padT} y2={padT + plotH} stroke="#5670AC" strokeWidth={1} strokeDasharray="2 3" />
        )}
        {hoverIdx !== null &&
          chartable.map((s) => {
            const price = priceAt(s, months[hoverIdx]);
            if (price === null) return null;
            return (
              <circle key={s.stage} cx={x(hoverIdx)} cy={y(price)} r={4} fill="#fff" stroke={STAGE_COLOR[s.stage]} strokeWidth={2} />
            );
          })}
      </svg>

      {hoverIdx !== null && (
        <div
          className="absolute top-2 bg-white border border-gray-200 rounded-lg shadow-lg px-3 py-2 text-xs pointer-events-none"
          style={{
            left: `${Math.min(85, Math.max(2, (x(hoverIdx) / W) * 100))}%`,
            minWidth: "150px",
          }}
        >
          <p className="font-bold text-gray-900 mb-1.5">{fmtMonth(months[hoverIdx])}</p>
          {[...chartable]
            .filter((s) => priceAt(s, months[hoverIdx]) !== null)
            .sort((a, b) => priceAt(b, months[hoverIdx])! - priceAt(a, months[hoverIdx])!)
            .map((s) => (
              <div key={s.stage} className="flex items-center justify-between gap-3 py-0.5">
                <span className="flex items-center gap-1.5 text-gray-600">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ background: STAGE_COLOR[s.stage] }} />
                  {STAGE_LABELS[s.stage]}
                </span>
                <span className="font-mono font-semibold text-gray-900">{fmtPrice(priceAt(s, months[hoverIdx])!)}</span>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}

// ─── Main explorer ────────────────────────────────────────────────────────────

export default function PriceTrendsExplorer({
  data,
  defaultLocality,
}: {
  data: LocalityGroupData[];
  defaultLocality: Locality;
}) {
  const initialLocality = data.find((l) => l.locality === defaultLocality)?.locality ?? data[0]?.locality;
  const [locality, setLocality] = useState<Locality | undefined>(initialLocality);

  const localityData = data.find((l) => l.locality === locality);
  const tiers = localityData?.tiers ?? [];

  const [tier, setTier] = useState<ProjectTier | undefined>(tiers[0]?.tier);
  const activeTier = tiers.find((t) => t.tier === tier) ?? tiers[0];

  function changeLocality(l: Locality) {
    setLocality(l);
    const nextTiers = data.find((d) => d.locality === l)?.tiers ?? [];
    setTier(nextTiers[0]?.tier);
  }

  if (data.length === 0) {
    return (
      <div className="card p-10 text-center text-gray-400 text-sm">
        Price data coming soon for the Neopolis district.
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Locality selector */}
      <div className="flex items-center gap-3">
        <label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5 shrink-0">
          <MapPin className="w-4 h-4 text-brand-500" /> Locality
        </label>
        <select
          value={locality}
          onChange={(e) => changeLocality(e.target.value as Locality)}
          className="border border-gray-200 rounded-xl px-4 py-2 text-sm font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-400 bg-white"
        >
          {data.map((l) => (
            <option key={l.locality} value={l.locality}>{l.locality}</option>
          ))}
        </select>
      </div>

      <div className="card p-5">
        {/* Tier tabs */}
        <div className="flex bg-gray-100 rounded-lg p-0.5 gap-0.5 mb-5 overflow-x-auto">
          {tiers.map((t) => (
            <button
              key={t.tier}
              onClick={() => setTier(t.tier)}
              className={`flex-1 whitespace-nowrap px-4 py-2 rounded-md text-sm font-semibold transition-colors ${
                activeTier?.tier === t.tier
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {TIER_LABELS[t.tier]}
            </button>
          ))}
        </div>

        {activeTier && (
          <>
            {/* Current price per stage, bold, colour-matched to its line */}
            <div className="flex flex-wrap gap-x-6 gap-y-2 mb-5">
              {activeTier.stages.map((s) => {
                const latest = s.points[s.points.length - 1];
                return (
                  <div key={s.stage} className="flex items-baseline gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: STAGE_COLOR[s.stage] }} />
                    <span className="text-xs text-gray-500">{STAGE_LABELS[s.stage]}</span>
                    <span className="text-base font-extrabold text-gray-900">{fmtPrice(latest.price)}</span>
                  </div>
                );
              })}
            </div>

            <StageTrendChart stages={activeTier.stages} />
          </>
        )}
      </div>
    </div>
  );
}
