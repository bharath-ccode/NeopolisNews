"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  HardHat, PlusCircle, Edit2, Eye, CheckCircle2, Clock,
  FileText, Trash2,
} from "lucide-react";
import { useBuilderAuth } from "@/context/BuilderAuthContext";
import { Article, toArticle } from "@/lib/newsStore";

export default function BuilderUpdatesPage() {
  const { builder } = useBuilderAuth();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    if (!builder) return;
    setLoading(true);
    const res = await fetch(`/api/articles?builder_id=${builder.id}&status=all`);
    const data = await res.json().catch(() => []);
    setArticles(Array.isArray(data) ? data.map(toArticle) : []);
    setLoading(false);
  }, [builder]);

  useEffect(() => { load(); }, [load]);

  async function handleDelete(id: string) {
    setDeleting(true);
    await fetch(`/api/articles/${id}`, { method: "DELETE" }).catch(() => {});
    setConfirmId(null);
    setDeleting(false);
    load();
  }

  const published = articles.filter((a) => a.status === "published").length;
  const drafts = articles.filter((a) => a.status === "draft").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <HardHat className="w-5 h-5 text-orange-500" />
            <h1 className="text-xl font-extrabold text-gray-900">Construction Updates</h1>
          </div>
          <p className="text-sm text-gray-400 mt-0.5">
            {loading ? "Loading…" : `${articles.length} total · ${published} published · ${drafts} drafts`}
          </p>
        </div>
        <Link href="/builder/updates/create" className="btn-primary text-sm py-2">
          <PlusCircle className="w-4 h-4" />
          Post Update
        </Link>
      </div>

      {loading ? (
        <div className="card p-12 text-center text-gray-400 text-sm">Loading…</div>
      ) : articles.length === 0 ? (
        <div className="card p-12 text-center">
          <FileText className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <p className="font-medium text-gray-500">No updates posted yet</p>
          <p className="text-sm text-gray-400 mt-1 max-w-xs mx-auto">
            Post construction milestones, floor slab completions, and progress photos.
          </p>
          <Link
            href="/builder/updates/create"
            className="btn-primary text-sm py-2 mt-4 inline-flex"
          >
            <PlusCircle className="w-4 h-4" />
            Post First Update
          </Link>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left text-xs font-semibold text-gray-500 px-5 py-3">Update</th>
                <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3 hidden sm:table-cell">Date</th>
                <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3 hidden md:table-cell">Views</th>
                <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Status</th>
                <th className="text-right text-xs font-semibold text-gray-500 px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {articles.map((a) => (
                <tr key={a.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4">
                    <p className="font-medium text-gray-900 line-clamp-2 leading-snug">{a.title}</p>
                    {a.projectId && (
                      <p className="text-xs text-brand-600 mt-0.5">Linked to project</p>
                    )}
                  </td>
                  <td className="px-4 py-4 hidden sm:table-cell text-xs text-gray-500">{a.date}</td>
                  <td className="px-4 py-4 hidden md:table-cell">
                    <span className="flex items-center gap-1 text-sm text-gray-500">
                      <Eye className="w-3.5 h-3.5 text-gray-400" />
                      {a.views.toLocaleString("en-IN")}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${
                      a.status === "published"
                        ? "bg-green-100 text-green-700"
                        : "bg-orange-100 text-orange-700"
                    }`}>
                      {a.status === "published"
                        ? <CheckCircle2 className="w-3 h-3" />
                        : <Clock className="w-3 h-3" />}
                      {a.status}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        href={`/builder/updates/${a.id}/edit`}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-brand-600 hover:bg-brand-50 transition-colors"
                        title="Edit"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </Link>
                      {confirmId === a.id ? (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleDelete(a.id)}
                            disabled={deleting}
                            className="px-2 py-1 rounded-md bg-red-600 text-white text-xs font-medium hover:bg-red-700 transition-colors disabled:opacity-60"
                          >
                            Delete
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
                          onClick={() => setConfirmId(a.id)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
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
