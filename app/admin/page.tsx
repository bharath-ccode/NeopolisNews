"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Newspaper,
  Eye,
  FileText,
  Star,
  TrendingUp,
  PlusCircle,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { getArticles, getArticleStats, Article } from "@/lib/newsStore";

export default function AdminDashboardPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    published: 0,
    drafts: 0,
    sponsored: 0,
    totalViews: 0,
  });

  useEffect(() => {
    getArticles().then(setArticles);
    getArticleStats().then(setStats);
  }, []);

  const recent = [...articles]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);

  const STAT_CARDS = [
    {
      label: "Total Articles",
      value: stats.total,
      icon: Newspaper,
      color: "bg-brand-50 text-brand-600",
      border: "border-brand-100",
    },
    {
      label: "Published",
      value: stats.published,
      icon: CheckCircle2,
      color: "bg-green-50 text-green-600",
      border: "border-green-100",
    },
    {
      label: "Drafts",
      value: stats.drafts,
      icon: FileText,
      color: "bg-orange-50 text-orange-600",
      border: "border-orange-100",
    },
    {
      label: "Sponsored",
      value: stats.sponsored,
      icon: Star,
      color: "bg-yellow-50 text-yellow-600",
      border: "border-yellow-100",
    },
    {
      label: "Total Views",
      value: stats.totalViews.toLocaleString("en-IN"),
      icon: Eye,
      color: "bg-blue-50 text-blue-600",
      border: "border-blue-100",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Welcome back, Admin
          </h2>
          <p className="text-gray-500 text-sm mt-0.5">
            Here&apos;s an overview of your news platform.
          </p>
        </div>
        <Link href="/admin/news/create" className="btn-primary text-sm py-2 self-start sm:self-auto">
          <PlusCircle className="w-4 h-4" />
          New Article
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {STAT_CARDS.map((s) => (
          <div
            key={s.label}
            className={`bg-white rounded-xl border ${s.border} p-4 shadow-sm`}
          >
            <div className={`inline-flex p-2 rounded-lg ${s.color} mb-3`}>
              <s.icon className="w-4 h-4" />
            </div>
            <p className="text-2xl font-extrabold text-gray-900">{s.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Quick links */}
      <div className="grid sm:grid-cols-3 gap-4">
        <Link
          href="/admin/news/create"
          className="card p-5 flex items-center gap-4 hover:border-brand-300 group"
        >
          <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center shrink-0 group-hover:bg-brand-100 transition-colors">
            <PlusCircle className="w-5 h-5 text-brand-600" />
          </div>
          <div>
            <p className="font-semibold text-gray-900 text-sm">New Article</p>
            <p className="text-xs text-gray-400">Write and publish news</p>
          </div>
          <ArrowRight className="w-4 h-4 text-gray-300 ml-auto group-hover:text-brand-500 transition-colors" />
        </Link>

        <Link
          href="/admin/news"
          className="card p-5 flex items-center gap-4 hover:border-brand-300 group"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0 group-hover:bg-blue-100 transition-colors">
            <Newspaper className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="font-semibold text-gray-900 text-sm">Manage Articles</p>
            <p className="text-xs text-gray-400">Edit, delete, publish</p>
          </div>
          <ArrowRight className="w-4 h-4 text-gray-300 ml-auto group-hover:text-brand-500 transition-colors" />
        </Link>

        <Link
          href="/admin/analytics"
          className="card p-5 flex items-center gap-4 hover:border-brand-300 group"
        >
          <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center shrink-0 group-hover:bg-purple-100 transition-colors">
            <TrendingUp className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <p className="font-semibold text-gray-900 text-sm">Analytics</p>
            <p className="text-xs text-gray-400">Views, traffic & stats</p>
          </div>
          <ArrowRight className="w-4 h-4 text-gray-300 ml-auto group-hover:text-brand-500 transition-colors" />
        </Link>
      </div>

      {/* Recent Articles */}
      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Recent Articles</h3>
          <Link
            href="/admin/news"
            className="text-sm text-brand-600 hover:underline font-medium"
          >
            View all
          </Link>
        </div>
        <div className="divide-y divide-gray-50">
          {recent.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-400 text-sm">
              No articles yet.{" "}
              <Link href="/admin/news/create" className="text-brand-600 hover:underline">
                Create your first article
              </Link>
            </div>
          ) : (
            recent.map((article) => (
              <div
                key={article.id}
                className="px-6 py-4 flex items-start gap-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`badge text-xs ${article.tagColor}`}
                    >
                      {article.tag}
                    </span>
                    {article.sponsored && (
                      <span className="badge bg-yellow-100 text-yellow-700 text-xs">
                        Sponsored
                      </span>
                    )}
                    <span
                      className={`badge text-xs ${
                        article.status === "published"
                          ? "bg-green-100 text-green-700"
                          : "bg-orange-100 text-orange-700"
                      }`}
                    >
                      {article.status === "published" ? (
                        <CheckCircle2 className="w-3 h-3" />
                      ) : (
                        <AlertCircle className="w-3 h-3" />
                      )}
                      {article.status}
                    </span>
                  </div>
                  <p className="font-medium text-gray-900 text-sm truncate">
                    {article.title}
                  </p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {article.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3" /> {article.views.toLocaleString("en-IN")} views
                    </span>
                  </div>
                </div>
                <Link
                  href={`/admin/news/${article.id}/edit`}
                  className="text-xs text-brand-600 hover:underline shrink-0 font-medium"
                >
                  Edit
                </Link>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
