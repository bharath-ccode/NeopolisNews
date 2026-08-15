"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Building2, ChevronRight, Tag, X, GitCompare, MapPin, LayoutGrid, List, HardHat } from "lucide-react";
import type { ProjectType, ProjectTier, LifecycleStatus, Locality } from "@/lib/projectsStore";
import { LIFECYCLE_STAGES, LOCALITIES } from "@/lib/projectsStore";

type View = "cards" | "list";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ProjectListItem {
  id: string;
  project_name: string;
  builder_name: string | null;
  total_units: number | null;
  total_land_area_acres: number | null;
  project_logo_url: string | null;
  project_type: ProjectType | null;
  tier: ProjectTier | null;
  locality: Locality | null;
  lifecycle_status: LifecycleStatus | null;
  price_range_min: number | null;
  price_range_max: number | null;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const TYPE_LABELS: Record<ProjectType, string> = {
  apartments:        "Apartments",
  independent_homes: "Independent Homes",
  residential:       "Residential",
  mixed_use:         "Mixed Use",
  commercial:        "Commercial",
};

const TIER_LABELS: Record<ProjectTier, string> = {
  affordable:  "Affordable",
  premium:     "Premium",
  luxury:      "Luxury",
  uber_luxury: "Uber Luxury",
};

const TIER_COLORS: Record<ProjectTier, string> = {
  affordable:  "bg-blue-600 text-white text-xs font-semibold px-2 py-0.5 rounded-full",
  premium:     "bg-purple-600 text-white text-xs font-semibold px-2 py-0.5 rounded-full",
  luxury:      "bg-amber-500 text-gray-900 text-xs font-semibold px-2 py-0.5 rounded-full",
  uber_luxury: "bg-rose-600 text-white text-xs font-semibold px-2 py-0.5 rounded-full",
};

const STATUS_COLORS: Record<LifecycleStatus, string> = {
  pre_launch:         "bg-gray-500 text-white",
  rera_registered:    "bg-sky-600 text-white",
  under_construction: "bg-orange-500 text-white",
  structure_complete: "bg-yellow-400 text-gray-900",
  finishing:          "bg-lime-400 text-gray-900",
  oc_received:        "bg-teal-500 text-white",
  ready_to_move:      "bg-green-600 text-white",
};

// ─── Filter pill component ────────────────────────────────────────────────────

function FilterPill({
  label, active, onClick,
}: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
        active
          ? "bg-brand-600 text-white shadow-sm"
          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
      }`}
    >
      {label}
    </button>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function ProjectFiltersGrid({ projects }: { projects: ProjectListItem[] }) {
  const router = useRouter();
  const [typeFilter, setTypeFilter]     = useState<ProjectType | "all">("all");
  const [tierFilter, setTierFilter]     = useState<ProjectTier | "all">("all");
  const [localityFilter, setLocalityFilter] = useState<Locality | "all">("all");
  const [statusFilter, setStatusFilter] = useState<LifecycleStatus | "all">("all");
  const [compareIds, setCompareIds]     = useState<string[]>([]);
  const [view, setView] = useState<View>("cards");

  const filtered = projects.filter((p) => {
    if (typeFilter     !== "all" && p.project_type     !== typeFilter)     return false;
    if (tierFilter     !== "all" && p.tier             !== tierFilter)     return false;
    if (localityFilter !== "all" && p.locality         !== localityFilter) return false;
    if (statusFilter   !== "all" && p.lifecycle_status !== statusFilter)   return false;
    return true;
  });

  const hasActiveFilter =
    typeFilter !== "all" || tierFilter !== "all" || localityFilter !== "all" || statusFilter !== "all";

  function clearAll() {
    setTypeFilter("all");
    setTierFilter("all");
    setLocalityFilter("all");
    setStatusFilter("all");
  }

  function toggleCompare(id: string) {
    setCompareIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 2) return prev; // max 2
      return [...prev, id];
    });
  }

  function goCompare() {
    if (compareIds.length === 2) {
      router.push(`/compare?a=${compareIds[0]}&b=${compareIds[1]}`);
    }
  }

  const compareNames = compareIds.map(
    (id) => projects.find((p) => p.id === id)?.project_name ?? ""
  );

  return (
    <>
      {/* ── Filter bar ── */}
      <div className="mb-6 space-y-3">
        {/* Locality */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider w-14 shrink-0">Area</span>
          <div className="flex gap-2 flex-wrap">
            <FilterPill label="All" active={localityFilter === "all"} onClick={() => setLocalityFilter("all")} />
            {LOCALITIES.map((l) => (
              <FilterPill key={l} label={l} active={localityFilter === l} onClick={() => setLocalityFilter(l)} />
            ))}
          </div>
        </div>

        {/* Project Type */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider w-14 shrink-0">Type</span>
          <div className="flex gap-2 flex-wrap">
            <FilterPill label="All" active={typeFilter === "all"} onClick={() => setTypeFilter("all")} />
            {(Object.entries(TYPE_LABELS) as [ProjectType, string][]).map(([val, label]) => (
              <FilterPill key={val} label={label} active={typeFilter === val} onClick={() => setTypeFilter(val)} />
            ))}
          </div>
        </div>

        {/* Tier */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider w-14 shrink-0">Tier</span>
          <div className="flex gap-2 flex-wrap">
            <FilterPill label="All" active={tierFilter === "all"} onClick={() => setTierFilter("all")} />
            {(Object.entries(TIER_LABELS) as [ProjectTier, string][]).map(([val, label]) => (
              <FilterPill key={val} label={label} active={tierFilter === val} onClick={() => setTierFilter(val)} />
            ))}
          </div>
        </div>

        {/* Status */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider w-14 shrink-0">Status</span>
          <div className="flex gap-2 flex-wrap">
            <FilterPill label="All" active={statusFilter === "all"} onClick={() => setStatusFilter("all")} />
            {LIFECYCLE_STAGES.map((s) => (
              <FilterPill key={s.id} label={s.label} active={statusFilter === s.id} onClick={() => setStatusFilter(s.id)} />
            ))}
          </div>
        </div>

        {hasActiveFilter && (
          <div className="pt-1">
            <button
              type="button"
              onClick={clearAll}
              className="flex items-center gap-1 text-xs font-semibold text-red-500 hover:text-red-700 transition-colors"
            >
              <X className="w-3.5 h-3.5" /> Clear filters
            </button>
          </div>
        )}
      </div>

      {/* ── View toggle ── */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-gray-500">
          {hasActiveFilter
            ? `${filtered.length} of ${projects.length} project${projects.length !== 1 ? "s" : ""}`
            : `${filtered.length} project${filtered.length !== 1 ? "s" : ""}`}
        </span>
        <div className="flex bg-gray-100 rounded-lg p-0.5 gap-0.5 w-fit">
          <button
            type="button"
            onClick={() => setView("cards")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
              view === "cards" ? "bg-white text-brand-700 shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" /> Cards
          </button>
          <button
            type="button"
            onClick={() => setView("list")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
              view === "list" ? "bg-white text-brand-700 shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <List className="w-3.5 h-3.5" /> List
          </button>
        </div>
      </div>

      {/* ── Cards / List ── */}
      {filtered.length === 0 ? (
        <div className="card p-16 text-center">
          <Building2 className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <p className="font-medium text-gray-500">No projects match these filters</p>
          <button type="button" onClick={clearAll} className="text-sm text-brand-600 hover:underline mt-2">
            Clear filters
          </button>
        </div>
      ) : view === "list" ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Project</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Builder</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Locality</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">Type</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Tier</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Stage</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Price</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((p) => {
                const tier      = p.tier;
                const type      = p.project_type;
                const status    = p.lifecycle_status;
                const hasPrice  = p.price_range_min || p.price_range_max;
                const inCompare = compareIds.includes(p.id);
                const compareDisabled = compareIds.length >= 2 && !inCompare;

                return (
                  <tr key={p.id} className={`hover:bg-gray-50 transition-colors ${inCompare ? "bg-indigo-50/50" : ""}`}>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        {p.project_logo_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={p.project_logo_url}
                            alt={p.project_name}
                            className="w-12 h-12 rounded-lg object-contain border border-gray-100 shrink-0 bg-white p-0.5"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-brand-50 flex items-center justify-center shrink-0">
                            <Building2 className="w-5 h-5 text-brand-400" />
                          </div>
                        )}
                        <span className="font-semibold text-gray-900">{p.project_name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-gray-500 hidden md:table-cell">
                      <div className="flex items-center gap-1.5">
                        <HardHat className="w-3.5 h-3.5 text-gray-300 shrink-0" />
                        {p.builder_name ?? <span className="text-gray-300 italic">None</span>}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-gray-500 hidden md:table-cell">
                      {p.locality ? (
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-gray-300 shrink-0" /> {p.locality}
                        </div>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-gray-500 hidden lg:table-cell">
                      {type ? TYPE_LABELS[type] : <span className="text-gray-300">—</span>}
                    </td>
                    <td className="px-5 py-4">
                      {tier ? <span className={TIER_COLORS[tier]}>{TIER_LABELS[tier]}</span> : <span className="text-gray-300">—</span>}
                    </td>
                    <td className="px-5 py-4">
                      {status ? (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${STATUS_COLORS[status]}`}>
                          {LIFECYCLE_STAGES.find((s) => s.id === status)?.label}
                        </span>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-gray-700 font-semibold whitespace-nowrap">
                      {hasPrice
                        ? p.price_range_min && p.price_range_max
                          ? `₹${p.price_range_min.toLocaleString("en-IN")} – ₹${p.price_range_max.toLocaleString("en-IN")}`
                          : p.price_range_min
                          ? `From ₹${p.price_range_min.toLocaleString("en-IN")}`
                          : `Up to ₹${p.price_range_max!.toLocaleString("en-IN")}`
                        : <span className="text-gray-300 font-normal">—</span>}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/real-estate/${p.id}`}
                          className="flex items-center gap-1 text-xs font-semibold text-brand-600 hover:underline whitespace-nowrap"
                        >
                          View <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => toggleCompare(p.id)}
                          disabled={compareDisabled}
                          title={
                            inCompare ? "Remove from compare" :
                            compareDisabled ? "Already comparing 2 projects" :
                            "Add to compare"
                          }
                          className={`flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-colors whitespace-nowrap ${
                            inCompare
                              ? "bg-indigo-600 text-white border-indigo-600"
                              : compareDisabled
                              ? "border-gray-100 text-gray-300 cursor-not-allowed"
                              : "border-gray-200 text-gray-500 hover:border-indigo-400 hover:text-indigo-600"
                          }`}
                        >
                          <GitCompare className="w-3.5 h-3.5" />
                          {inCompare ? "✓" : "Compare"}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((p) => {
            const tier      = p.tier;
            const type      = p.project_type;
            const status    = p.lifecycle_status;
            const hasPrice  = p.price_range_min || p.price_range_max;
            const inCompare = compareIds.includes(p.id);
            const compareDisabled = compareIds.length >= 2 && !inCompare;

            return (
              <div
                key={p.id}
                className={`card overflow-hidden transition-all ${
                  inCompare ? "ring-2 ring-indigo-500 shadow-lg" : ""
                }`}
              >
                {/* Image / logo area */}
                <div className="h-36 bg-gradient-to-br from-brand-50 to-brand-100 flex items-center justify-center relative overflow-hidden">
                  {p.project_logo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={p.project_logo_url}
                      alt={p.project_name}
                      className="h-28 w-auto max-w-[80%] object-contain"
                    />
                  ) : (
                    <Building2 className="w-12 h-12 text-brand-300" />
                  )}
                  {status && (
                    <span className={`absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded-full ${STATUS_COLORS[status]}`}>
                      {LIFECYCLE_STAGES.find(s => s.id === status)?.label}
                    </span>
                  )}
                </div>

                <div className="p-4">
                  <div className="mb-2">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="font-bold text-gray-900 text-sm leading-snug">{p.project_name}</h3>
                      {tier && (
                        <span className={TIER_COLORS[tier]}>
                          {TIER_LABELS[tier]}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      {p.builder_name && (
                        <p className="text-xs text-gray-400">by {p.builder_name}</p>
                      )}
                      {p.locality && (
                        <span className="flex items-center gap-0.5 text-xs text-gray-400">
                          <MapPin className="w-3 h-3" /> {p.locality}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-gray-500 my-3">
                    {type && (
                      <span>Type: <strong className="text-gray-700">{TYPE_LABELS[type]}</strong></span>
                    )}
                    {p.total_units && (
                      <span>Units: <strong className="text-gray-700">{p.total_units.toLocaleString("en-IN")}</strong></span>
                    )}
                    {p.total_land_area_acres && (
                      <span>Land: <strong className="text-gray-700">{p.total_land_area_acres} acres</strong></span>
                    )}
                  </div>

                  {hasPrice && (
                    <div className="flex items-center gap-1 mb-3">
                      <Tag className="w-3.5 h-3.5 text-brand-500" />
                      <span className="text-sm font-extrabold text-brand-700">
                        {p.price_range_min && p.price_range_max
                          ? `₹${p.price_range_min.toLocaleString("en-IN")} – ₹${p.price_range_max.toLocaleString("en-IN")} /sft`
                          : p.price_range_min
                          ? `From ₹${p.price_range_min.toLocaleString("en-IN")} /sft`
                          : `Up to ₹${p.price_range_max!.toLocaleString("en-IN")} /sft`}
                      </span>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Link
                      href={`/real-estate/${p.id}`}
                      className="flex items-center justify-center gap-1 flex-1 border border-brand-200 text-brand-600 hover:bg-brand-50 text-sm font-semibold py-2 rounded-lg transition-colors"
                    >
                      View Details <ChevronRight className="w-4 h-4" />
                    </Link>
                    <button
                      type="button"
                      onClick={() => toggleCompare(p.id)}
                      disabled={compareDisabled}
                      title={
                        inCompare ? "Remove from compare" :
                        compareDisabled ? "Already comparing 2 projects" :
                        "Add to compare"
                      }
                      className={`flex items-center justify-center gap-1 px-3 py-2 rounded-lg text-xs font-semibold border transition-colors ${
                        inCompare
                          ? "bg-indigo-600 text-white border-indigo-600"
                          : compareDisabled
                          ? "border-gray-100 text-gray-300 cursor-not-allowed"
                          : "border-gray-200 text-gray-500 hover:border-indigo-400 hover:text-indigo-600"
                      }`}
                    >
                      <GitCompare className="w-3.5 h-3.5" />
                      {inCompare ? "✓" : "Compare"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Sticky compare bar ── */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-50 transition-transform duration-300 ${
          compareIds.length > 0 ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="bg-indigo-900 text-white shadow-2xl border-t border-indigo-700">
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-4 flex-wrap">
            <GitCompare className="w-5 h-5 text-indigo-300 shrink-0" />

            <div className="flex items-center gap-3 flex-1 min-w-0">
              {[0, 1].map((i) => (
                <div key={i} className="flex items-center gap-2 min-w-0">
                  {compareIds[i] ? (
                    <>
                      <span className="text-sm font-semibold text-white truncate max-w-[160px]">
                        {compareNames[i]}
                      </span>
                      <button
                        onClick={() => toggleCompare(compareIds[i])}
                        className="text-indigo-300 hover:text-white shrink-0"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </>
                  ) : (
                    <span className="text-sm text-indigo-400 border border-dashed border-indigo-600 px-3 py-0.5 rounded-full">
                      Pick {i === 0 ? "1st" : "2nd"} project
                    </span>
                  )}
                  {i === 0 && <span className="text-indigo-500 text-xs font-bold shrink-0">vs</span>}
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setCompareIds([])}
                className="text-xs text-indigo-300 hover:text-white transition-colors"
              >
                Clear
              </button>
              <button
                onClick={goCompare}
                disabled={compareIds.length < 2}
                className="flex items-center gap-2 bg-white text-indigo-900 font-bold text-sm px-5 py-2 rounded-xl hover:bg-indigo-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <GitCompare className="w-4 h-4" />
                Compare Now
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom padding so content isn't hidden behind sticky bar */}
      {compareIds.length > 0 && <div className="h-20" />}
    </>
  );
}
