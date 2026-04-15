"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  FolderKanban,
  FileText,
  PlusCircle,
  HardHat,
  Megaphone,
  ArrowRight,
  Building2,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { useBuilderAuth } from "@/context/BuilderAuthContext";
import { getProjectsByBuilderId, Project } from "@/lib/projectsStore";
import { getArticlesByBuilderId, Article } from "@/lib/newsStore";

export default function BuilderDashboard() {
  const { builder } = useBuilderAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!builder) return;
    Promise.all([
      getProjectsByBuilderId(builder.id),
      getArticlesByBuilderId(builder.id),
    ]).then(([p, a]) => {
      setProjects(p);
      setArticles(a);
      setLoading(false);
    });
  }, [builder]);

  const publishedCount = articles.filter((a) => a.status === "published").length;
  const draftCount     = articles.filter((a) => a.status === "draft").length;
  const recentArticles = articles.slice(0, 5);
  const recentProjects = projects.slice(0, 3);

  return (
    <div className="space-y-7">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900">
          Welcome, {builder?.builderName}
        </h1>
        <p className="text-sm text-gray-400 mt-0.5">
          Manage your projects and post news updates.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: "Projects",
            value: loading ? "—" : projects.length,
            icon: FolderKanban,
            color: "bg-brand-50 text-brand-600",
          },
          {
            label: "Published Updates",
            value: loading ? "—" : publishedCount,
            icon: CheckCircle2,
            color: "bg-green-50 text-green-600",
          },
          {
            label: "Drafts",
            value: loading ? "—" : draftCount,
            icon: Clock,
            color: "bg-orange-50 text-orange-600",
          },
          {
            label: "Total Posts",
            value: loading ? "—" : articles.length,
            icon: FileText,
            color: "bg-purple-50 text-purple-600",
          },
        ].map((s) => (
          <div key={s.label} className="card p-4">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${s.color}`}
            >
              <s.icon className="w-5 h-5" />
            </div>
            <p className="text-2xl font-extrabold text-gray-900">{s.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid sm:grid-cols-3 gap-4">
        <Link
          href="/builder/projects/create"
          className="card p-4 flex items-center gap-3 hover:border-brand-300 transition-colors group"
        >
          <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center shrink-0">
            <PlusCircle className="w-5 h-5 text-brand-600" />
          </div>
          <div>
            <p className="font-semibold text-sm text-gray-900 group-hover:text-brand-700">
              New Project
            </p>
            <p className="text-xs text-gray-400">Create a project page</p>
          </div>
          <ArrowRight className="w-4 h-4 text-gray-300 ml-auto" />
        </Link>

        <Link
          href="/builder/projects"
          className="card p-4 flex items-center gap-3 hover:border-orange-200 transition-colors group"
        >
          <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center shrink-0">
            <HardHat className="w-5 h-5 text-orange-600" />
          </div>
          <div>
            <p className="font-semibold text-sm text-gray-900 group-hover:text-orange-700">
              Construction Update
            </p>
            <p className="text-xs text-gray-400">Post for a project</p>
          </div>
          <ArrowRight className="w-4 h-4 text-gray-300 ml-auto" />
        </Link>

        <Link
          href="/builder/launches/create"
          className="card p-4 flex items-center gap-3 hover:border-green-200 transition-colors group"
        >
          <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center shrink-0">
            <Megaphone className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <p className="font-semibold text-sm text-gray-900 group-hover:text-green-700">
              Announce Launch
            </p>
            <p className="text-xs text-gray-400">New project launch</p>
          </div>
          <ArrowRight className="w-4 h-4 text-gray-300 ml-auto" />
        </Link>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Recent projects */}
        <div className="card overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
            <h2 className="font-bold text-sm text-gray-900">My Projects</h2>
            <Link
              href="/builder/projects"
              className="text-xs text-brand-600 font-semibold hover:underline"
            >
              View all
            </Link>
          </div>
          {loading ? (
            <div className="px-5 py-8 text-center text-sm text-gray-400">
              Loading…
            </div>
          ) : recentProjects.length === 0 ? (
            <div className="px-5 py-8 text-center">
              <Building2 className="w-8 h-8 text-gray-200 mx-auto mb-2" />
              <p className="text-sm text-gray-400">No projects yet</p>
              <Link
                href="/builder/projects/create"
                className="btn-primary text-xs py-1.5 mt-3 inline-flex"
              >
                Create First Project
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {recentProjects.map((p) => (
                <div
                  key={p.id}
                  className="px-5 py-3.5 flex items-center justify-between gap-3"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {p.projectName}
                    </p>
                    <p className="text-xs text-gray-400">
                      {p.totalUnits ? `${p.totalUnits} units` : "—"} ·{" "}
                      {p.totalLandAreaAcres
                        ? `${p.totalLandAreaAcres} acres`
                        : "—"}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Link
                      href={`/builder/projects/${p.id}/update`}
                      className="text-xs px-2 py-1 rounded-md bg-orange-50 text-orange-700 font-medium hover:bg-orange-100 transition-colors"
                    >
                      + Update
                    </Link>
                    <Link
                      href={`/builder/projects/${p.id}/edit`}
                      className="text-xs px-2 py-1 rounded-md bg-gray-50 text-gray-600 font-medium hover:bg-gray-100 transition-colors"
                    >
                      Edit
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent articles */}
        <div className="card overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
            <h2 className="font-bold text-sm text-gray-900">Recent Posts</h2>
          </div>
          {loading ? (
            <div className="px-5 py-8 text-center text-sm text-gray-400">
              Loading…
            </div>
          ) : recentArticles.length === 0 ? (
            <div className="px-5 py-8 text-center">
              <FileText className="w-8 h-8 text-gray-200 mx-auto mb-2" />
              <p className="text-sm text-gray-400">No posts yet</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {recentArticles.map((a) => (
                <div key={a.id} className="px-5 py-3.5">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium text-gray-900 leading-snug line-clamp-2 flex-1">
                      {a.title}
                    </p>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${
                        a.status === "published"
                          ? "bg-green-100 text-green-700"
                          : "bg-orange-100 text-orange-700"
                      }`}
                    >
                      {a.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {a.category === "construction"
                      ? "Construction Update"
                      : "New Launch"}{" "}
                    · {a.date}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
