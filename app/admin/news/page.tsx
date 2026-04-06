"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  PlusCircle,
  Search,
  Eye,
  Edit2,
  Trash2,
  Star,
  CheckCircle2,
  AlertCircle,
  Filter,
  Newspaper,
} from "lucide-react";
import clsx from "clsx";
import {
  getArticles,
  deleteArticle,
  updateArticle,
  Article,
  ArticleCategory,
} from "@/lib/newsStore";

const CATEGORIES: { value: "" | ArticleCategory; label: string }[] = [
  { value: "", label: "All Categories" },
  { value: "construction",   label: "Construction"   },
  { value: "launches",       label: "New Launches"   },
  { value: "infrastructure", label: "Infrastructure" },
  { value: "community",      label: "Community"      },
];

const STATUS_FILTERS = [
  { value: "", label: "All" },
  { value: "published", label: "Published" },
  { value: "draft", label: "Drafts" },
];

export default function AdminNewsPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<"" | ArticleCategory>("");
  const [statusFilter, setStatusFilter] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const refresh = useCallback(() => {
    setArticles(getArticles());
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const filtered = articles.filter((a) => {
    const matchSearch =
      !search ||
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.author.toLowerCase().includes(search.toLowerCase());
    const matchCat = !category || a.category === category;
    const matchStatus = !statusFilter || a.status === statusFilter;
    return matchSearch && matchCat && matchStatus;
  });

  function handleDelete(id: string) {
    deleteArticle(id);
    setDeleteConfirm(null);
    refresh();
  }

  function handleToggleStatus(article: Article) {
    const newStatus = article.status === "published" ? "draft" : "published";
    updateArticle(article.id, { status: newStatus });
    refresh();
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">News Articles</h2>
          <p className="text-gray-500 text-sm mt-0.5">
            {articles.length} total · {articles.filter((a) => a.status === "published").length} published · {articles.filter((a) => a.status === "draft").length} drafts
          </p>
        </div>
        <Link href="/admin/news/create" className="btn-primary text-sm py-2 self-start sm:self-auto">
          <PlusCircle className="w-4 h-4" />
          New Article
        </Link>
      </div>

      {/* Filters */}
      <div className="card p-4 flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search articles…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          />
        </div>

        {/* Category filter */}
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as "" | ArticleCategory)}
            className="pl-8 pr-8 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white appearance-none cursor-pointer"
          >
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        {/* Status tabs */}
        <div className="flex bg-gray-100 rounded-lg p-0.5 gap-0.5">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s.value}
              onClick={() => setStatusFilter(s.value)}
              className={clsx(
                "px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
                statusFilter === s.value
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              )}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {filtered.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <Newspaper className="w-10 h-10 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-500 text-sm font-medium">No articles found</p>
            <p className="text-gray-400 text-xs mt-1">
              {search || category || statusFilter
                ? "Try adjusting your filters"
                : "Get started by creating your first article"}
            </p>
            {!search && !category && !statusFilter && (
              <Link
                href="/admin/news/create"
                className="btn-primary text-sm py-2 mt-4 inline-flex"
              >
                <PlusCircle className="w-4 h-4" />
                Create Article
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left text-xs font-semibold text-gray-500 px-5 py-3">
                    Article
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3 hidden md:table-cell">
                    Category
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3 hidden lg:table-cell">
                    Author
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3 hidden sm:table-cell">
                    Views
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">
                    Status
                  </th>
                  <th className="text-right text-xs font-semibold text-gray-500 px-5 py-3">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((article) => (
                  <tr
                    key={article.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    {/* Title */}
                    <td className="px-5 py-4">
                      <div className="flex items-start gap-2">
                        {article.sponsored && (
                          <Star className="w-3.5 h-3.5 text-yellow-500 shrink-0 mt-0.5" />
                        )}
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 line-clamp-2 leading-snug">
                            {article.title}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">{article.date}</p>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="px-4 py-4 hidden md:table-cell">
                      <span className={`badge text-xs ${article.tagColor}`}>
                        {article.tag}
                      </span>
                    </td>

                    {/* Author */}
                    <td className="px-4 py-4 hidden lg:table-cell">
                      <span className="text-sm text-gray-600">{article.author}</span>
                    </td>

                    {/* Views */}
                    <td className="px-4 py-4 hidden sm:table-cell">
                      <span className="flex items-center gap-1 text-sm text-gray-600">
                        <Eye className="w-3.5 h-3.5 text-gray-400" />
                        {article.views.toLocaleString("en-IN")}
                      </span>
                    </td>

                    {/* Status toggle */}
                    <td className="px-4 py-4">
                      <button
                        onClick={() => handleToggleStatus(article)}
                        title={`Click to ${article.status === "published" ? "unpublish" : "publish"}`}
                        className={clsx(
                          "badge text-xs cursor-pointer hover:opacity-80 transition-opacity",
                          article.status === "published"
                            ? "bg-green-100 text-green-700"
                            : "bg-orange-100 text-orange-700"
                        )}
                      >
                        {article.status === "published" ? (
                          <CheckCircle2 className="w-3 h-3" />
                        ) : (
                          <AlertCircle className="w-3 h-3" />
                        )}
                        {article.status}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/admin/news/${article.id}/edit`}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-brand-600 hover:bg-brand-50 transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </Link>
                        {deleteConfirm === article.id ? (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleDelete(article.id)}
                              className="px-2 py-1 rounded-md bg-red-600 text-white text-xs font-medium hover:bg-red-700 transition-colors"
                            >
                              Confirm
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(null)}
                              className="px-2 py-1 rounded-md border border-gray-200 text-gray-600 text-xs hover:bg-gray-50 transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirm(article.id)}
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
    </div>
  );
}
