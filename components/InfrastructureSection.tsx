"use client";

import { useState } from "react";
import { TrendingUp, ChevronLeft, ChevronRight, Clock, Eye, Newspaper, Calendar } from "lucide-react";
import Link from "next/link";
import { Article } from "@/lib/newsStore";

interface Props {
  articles: Article[];
}

const PAGE_SIZE = 6;

export default function InfrastructureSection({ articles }: Props) {
  const [page, setPage] = useState(0);

  const totalPages = Math.ceil(articles.length / PAGE_SIZE);
  const pageArticles = articles.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  if (articles.length === 0) return null;

  return (
    <div id="infrastructure" className="mb-12 last:mb-0">
      {/* Section header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-blue-50 text-blue-600">
            <TrendingUp className="w-4 h-4" />
          </div>
          <h2 className="section-heading !mb-0">Infrastructure</h2>
          <span className="text-xs text-gray-400 font-medium">
            {articles.length} article{articles.length !== 1 ? "s" : ""}
          </span>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs text-gray-500 font-medium px-1">
              {page + 1} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page === totalPages - 1}
              className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Tile grid — Links so Google can crawl each article */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {pageArticles.map((article) => (
          <Link
            key={article.id}
            href={`/news/${article.id}`}
            className="card p-0 overflow-hidden text-left group hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            {article.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={article.imageUrl}
                alt={article.title}
                className="h-36 w-full object-cover"
              />
            ) : (
              <div className="h-36 bg-gradient-to-br from-blue-600 to-brand-700 flex items-center justify-center">
                <TrendingUp className="w-10 h-10 text-white/30" />
              </div>
            )}

            <div className="p-4 flex flex-col flex-1">
              <h3 className="font-bold text-gray-900 text-sm leading-snug mb-2 group-hover:text-brand-700 transition-colors line-clamp-3">
                {article.title}
              </h3>

              <div className="mt-auto pt-3 border-t border-gray-100 space-y-1">
                {article.source && (
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <Newspaper className="w-3 h-3 text-gray-400 shrink-0" />
                    <span className="font-medium">{article.source}</span>
                  </div>
                )}
                <div className="flex items-center gap-3 text-xs text-gray-400">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 shrink-0" /> {article.date}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {article.readTime}
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye className="w-3 h-3" /> {article.views.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-6">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" /> Previous
          </button>
          <span className="text-sm text-gray-500">Page {page + 1} of {totalPages}</span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page === totalPages - 1}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Next <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
