"use client";

import { useState } from "react";
import Link from "next/link";
import { Building2, ChevronRight, Tag, CheckCircle, X } from "lucide-react";
import type { ProjectType, ProjectTier, LifecycleStatus } from "@/lib/projectsStore";
import { LIFECYCLE_STAGES } from "@/lib/projectsStore";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ProjectListItem {
  id: string;
  project_name: string;
  builder_name: string | null;
  total_units: number | null;
  total_land_area_acres: number | null;
  core_neopolis: boolean;
  project_logo_url: string | null;
  project_type: ProjectType | null;
  tier: ProjectTier | null;
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
  affordable:  "bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-0.5 rounded-full",
  premium:     "bg-purple-100 text-purple-700 text-xs font-semibold px-2 py-0.5 rounded-full",
  luxury:      "bg-amber-100 text-amber-800 text-xs font-semibold px-2 py-0.5 rounded-full",
  uber_luxury: "bg-rose-100 text-rose-800 text-xs font-semibold px-2 py-0.5 rounded-full",
};

const STATUS_COLORS: Record<LifecycleStatus, string> = {
  pre_launch:         "bg-gray-100 text-gray-600",
  rera_registered:    "bg-sky-100 text-sky-700",
  under_construction: "bg-orange-100 text-orange-700",
  structure_complete: "bg-yellow-100 text-yellow-700",
  finishing:          "bg-lime-100 text-lime-700",
  oc_received:        "bg-teal-100 text-teal-700",
  ready_to_move:      "bg-green-100 text-green-700",
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
  const [typeFilter, setTypeFilter]     = useState<ProjectType | "all">("all");
  const [tierFilter, setTierFilter]     = useState<ProjectTier | "all">("all");
  const [statusFilter, setStatusFilter] = useState<LifecycleStatus | "all">("all");

  const filtered = projects.filter((p) => {
    if (typeFilter   !== "all" && p.project_type     !== typeFilter)   return false;
    if (tierFilter   !== "all" && p.tier             !== tierFilter)   return false;
    if (statusFilter !== "all" && p.lifecycle_status !== statusFilter) return false;
    return true;
  });

  const hasActiveFilter = typeFilter !== "all" || tierFilter !== "all" || statusFilter !== "all";

  function clearAll() {
    setTypeFilter("all");
    setTierFilter("all");
    setStatusFilter("all");
  }

  return (
    <>
      {/* ── Filter bar ── */}
      <div className="mb-6 space-y-3">
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

        {/* Clear + count */}
        {hasActiveFilter && (
          <div className="flex items-center gap-3 pt-1">
            <span className="text-sm text-gray-500">
              {filtered.length} of {projects.length} project{projects.length !== 1 ? "s" : ""}
            </span>
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

      {/* ── Grid ── */}
      {filtered.length === 0 ? (
        <div className="card p-16 text-center">
          <Building2 className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <p className="font-medium text-gray-500">No projects match these filters</p>
          <button type="button" onClick={clearAll} className="text-sm text-brand-600 hover:underline mt-2">
            Clear filters
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((p) => {
            const tier   = p.tier;
            const type   = p.project_type;
            const status = p.lifecycle_status;
            const hasPrice = p.price_range_min || p.price_range_max;

            return (
              <div key={p.id} className={`card overflow-hidden ${p.core_neopolis ? "ring-2 ring-brand-500" : ""}`}>
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
                  {p.core_neopolis && (
                    <span className="absolute top-2 left-2 flex items-center gap-1 text-xs font-semibold bg-brand-600 text-white px-2 py-0.5 rounded-full">
                      <CheckCircle className="w-3 h-3" /> Core Neopolis
                    </span>
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
                    {p.builder_name && (
                      <p className="text-xs text-gray-400">by {p.builder_name}</p>
                    )}
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

                  <Link
                    href={`/real-estate/${p.id}`}
                    className="flex items-center justify-center gap-1 w-full border border-brand-200 text-brand-600 hover:bg-brand-50 text-sm font-semibold py-2 rounded-lg transition-colors"
                  >
                    View Details <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
