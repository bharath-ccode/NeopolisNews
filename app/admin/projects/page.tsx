"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  PlusCircle,
  Pencil,
  Trash2,
  Layers,
  Loader2,
  CheckCircle2,
  XCircle,
  HardHat,
  MapPin,
  Filter,
} from "lucide-react";
import {
  getProjects,
  deleteProject,
  LIFECYCLE_STAGES,
  LOCALITIES,
  type Project,
  type ProjectTier,
  type LifecycleStatus,
  type Locality,
} from "@/lib/projectsStore";

const TIER_META: Record<ProjectTier, { label: string; cls: string }> = {
  affordable:  { label: "Affordable",  cls: "tag-green"  },
  premium:     { label: "Premium",     cls: "tag-blue"   },
  luxury:      { label: "Luxury",      cls: "tag-purple" },
  uber_luxury: { label: "Uber Luxury", cls: "tag-purple" },
};

const LIFECYCLE_CLS: Record<LifecycleStatus, string> = {
  pre_launch:         "tag-blue",
  rera_registered:    "tag-blue",
  under_construction: "tag-orange",
  structure_complete: "tag-orange",
  finishing:          "tag-orange",
  oc_received:        "tag-green",
  ready_to_move:      "tag-green",
};

const LIFECYCLE_LABELS: Record<LifecycleStatus, string> = Object.fromEntries(
  LIFECYCLE_STAGES.map((s) => [s.id, s.label])
) as Record<LifecycleStatus, string>;

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [localityFilter, setLocalityFilter] = useState<Locality | "">("");

  async function load() {
    setLoading(true);
    try {
      setProjects(await getProjects());
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete "${name}"? All contacts and floor plans will also be removed.`)) return;
    setDeleting(id);
    try {
      await deleteProject(id);
      setProjects((prev) => prev.filter((p) => p.id !== id));
    } catch {
      alert("Failed to delete. Please try again.");
    } finally {
      setDeleting(null);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-brand-500" />
      </div>
    );
  }

  const filteredProjects = localityFilter
    ? projects.filter((p) => p.locality === localityFilter)
    : projects;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Projects</h2>
          <p className="text-sm text-gray-400">
            {filteredProjects.length} of {projects.length} project{projects.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <select
              value={localityFilter}
              onChange={(e) => setLocalityFilter(e.target.value as Locality | "")}
              className="pl-8 pr-8 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white appearance-none cursor-pointer"
            >
              <option value="">All Localities</option>
              {LOCALITIES.map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </div>
          <Link href="/admin/projects/create" className="btn-primary text-sm py-2">
            <PlusCircle className="w-3.5 h-3.5" />
            Add Project
          </Link>
        </div>
      </div>

      {filteredProjects.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
          <Layers className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          {projects.length === 0 ? (
            <>
              <p className="text-gray-500 font-medium">No projects yet</p>
              <p className="text-sm text-gray-400 mt-1">Create your first project to get started.</p>
              <Link href="/admin/projects/create" className="btn-primary text-sm py-2 mt-4 inline-flex">
                <PlusCircle className="w-3.5 h-3.5" /> Add Project
              </Link>
            </>
          ) : (
            <>
              <p className="text-gray-500 font-medium">No projects in {localityFilter}</p>
              <button
                type="button"
                onClick={() => setLocalityFilter("")}
                className="text-sm text-brand-600 hover:underline mt-2"
              >
                Clear filter
              </button>
            </>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Project
                </th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">
                  Builder
                </th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">
                  Locality
                </th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Tier
                </th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Stage
                </th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">
                  Land (acres)
                </th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">
                  Units
                </th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Core
                </th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredProjects.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      {p.projectLogoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={p.projectLogoUrl}
                          alt={p.projectName}
                          className="w-14 h-14 rounded-lg object-contain border border-gray-100 shrink-0 bg-white p-0.5"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-lg bg-brand-50 flex items-center justify-center shrink-0">
                          <Layers className="w-6 h-6 text-brand-400" />
                        </div>
                      )}
                      <span className="font-medium text-gray-900">{p.projectName}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-gray-500 hidden md:table-cell">
                    <div className="flex items-center gap-1.5">
                      <HardHat className="w-3.5 h-3.5 text-gray-300 shrink-0" />
                      {p.builderName ?? <span className="text-gray-300 italic">None</span>}
                    </div>
                  </td>
                  <td className="px-5 py-4 text-gray-500 hidden md:table-cell">
                    {p.locality ? (
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-gray-300 shrink-0" />
                        {p.locality}
                      </div>
                    ) : (
                      <span className="text-gray-300">—</span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    {p.tier ? (
                      <span className={`badge text-xs ${TIER_META[p.tier].cls}`}>
                        {TIER_META[p.tier].label}
                      </span>
                    ) : (
                      <span className="text-gray-300">—</span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    {p.lifecycleStatus ? (
                      <span className={`badge text-xs ${LIFECYCLE_CLS[p.lifecycleStatus]}`}>
                        {LIFECYCLE_LABELS[p.lifecycleStatus]}
                      </span>
                    ) : (
                      <span className="text-gray-300">—</span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-gray-500 hidden lg:table-cell">
                    {p.totalLandAreaAcres ?? "—"}
                  </td>
                  <td className="px-5 py-4 text-gray-500 hidden lg:table-cell">
                    {p.totalUnits?.toLocaleString() ?? "—"}
                  </td>
                  <td className="px-5 py-4">
                    {p.coreNeopolis ? (
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                    ) : (
                      <XCircle className="w-4 h-4 text-gray-300" />
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/projects/${p.id}/edit`}
                        className="p-1.5 text-brand-500 hover:bg-brand-50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Pencil className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(p.id, p.projectName)}
                        disabled={deleting === p.id}
                        className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                        title="Delete"
                      >
                        {deleting === p.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
