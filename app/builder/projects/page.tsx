"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  PlusCircle,
  Building2,
  Edit2,
  Trash2,
  HardHat,
} from "lucide-react";
import { useBuilderAuth } from "@/context/BuilderAuthContext";
import { getProjectsByBuilderId, deleteProject, Project } from "@/lib/projectsStore";

export default function BuilderProjectsPage() {
  const { builder } = useBuilderAuth();
  const [projects, setProjects]   = useState<Project[]>([]);
  const [loading, setLoading]     = useState(true);
  const [deleting, setDeleting]   = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!builder) return;
    setLoading(true);
    const data = await getProjectsByBuilderId(builder.id);
    setProjects(data);
    setLoading(false);
  }, [builder]);

  useEffect(() => { load(); }, [load]);

  async function handleDelete(id: string) {
    setDeleting(id);
    await deleteProject(id);
    setConfirmId(null);
    setDeleting(null);
    load();
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-gray-900">My Projects</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {projects.length} project{projects.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Link href="/builder/projects/create" className="btn-primary text-sm py-2">
          <PlusCircle className="w-4 h-4" />
          New Project
        </Link>
      </div>

      {/* List */}
      {loading ? (
        <div className="card p-12 text-center text-gray-400 text-sm">Loading…</div>
      ) : projects.length === 0 ? (
        <div className="card p-12 text-center">
          <Building2 className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <p className="font-medium text-gray-500">No projects yet</p>
          <p className="text-sm text-gray-400 mt-1">
            Create your first project to start posting updates.
          </p>
          <Link
            href="/builder/projects/create"
            className="btn-primary text-sm py-2 mt-4 inline-flex"
          >
            <PlusCircle className="w-4 h-4" />
            Create Project
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {projects.map((p) => (
            <div
              key={p.id}
              className="card p-5 flex items-center gap-4"
            >
              {/* Logo / icon */}
              <div className="w-12 h-12 rounded-xl border border-gray-100 flex items-center justify-center shrink-0 overflow-hidden bg-gray-50">
                {p.projectLogoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={p.projectLogoUrl}
                    alt={p.projectName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Building2 className="w-6 h-6 text-gray-300" />
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-900 truncate">{p.projectName}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {[
                    p.totalUnits ? `${p.totalUnits} units` : null,
                    p.totalLandAreaAcres ? `${p.totalLandAreaAcres} acres` : null,
                    p.coreNeopolis ? "Core Neopolis" : null,
                  ]
                    .filter(Boolean)
                    .join(" · ") || "No details yet"}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 shrink-0">
                <Link
                  href={`/builder/projects/${p.id}/update`}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-orange-50 text-orange-700 hover:bg-orange-100 transition-colors"
                >
                  <HardHat className="w-3.5 h-3.5" />
                  Post Update
                </Link>
                <Link
                  href={`/builder/projects/${p.id}/edit`}
                  className="p-2 rounded-lg text-gray-400 hover:text-brand-600 hover:bg-brand-50 transition-colors"
                  title="Edit"
                >
                  <Edit2 className="w-4 h-4" />
                </Link>
                {confirmId === p.id ? (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleDelete(p.id)}
                      disabled={deleting === p.id}
                      className="px-2 py-1 rounded-md bg-red-600 text-white text-xs font-medium hover:bg-red-700 transition-colors disabled:opacity-60"
                    >
                      Confirm
                    </button>
                    <button
                      onClick={() => setConfirmId(null)}
                      className="px-2 py-1 rounded-md border border-gray-200 text-gray-600 text-xs hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmId(p.id)}
                    className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
