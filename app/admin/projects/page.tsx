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
} from "lucide-react";
import { getProjects, deleteProject, type Project } from "@/lib/projectsStore";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Projects</h2>
          <p className="text-sm text-gray-400">
            {projects.length} project{projects.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Link href="/admin/projects/create" className="btn-primary text-sm py-2">
          <PlusCircle className="w-3.5 h-3.5" />
          Add Project
        </Link>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
          <Layers className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No projects yet</p>
          <p className="text-sm text-gray-400 mt-1">Create your first project to get started.</p>
          <Link href="/admin/projects/create" className="btn-primary text-sm py-2 mt-4 inline-flex">
            <PlusCircle className="w-3.5 h-3.5" /> Add Project
          </Link>
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
              {projects.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      {p.projectLogoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={p.projectLogoUrl}
                          alt={p.projectName}
                          className="w-9 h-9 rounded-lg object-cover border border-gray-100 shrink-0"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-lg bg-brand-50 flex items-center justify-center shrink-0">
                          <Layers className="w-4 h-4 text-brand-400" />
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
