"use client";

import { useState } from "react";
import { TrendingUp, ChevronLeft, ChevronRight, X, Clock, Eye, Newspaper, Calendar } from "lucide-react";
import { Article } from "@/lib/newsStore";

interface Props {
  articles: Article[];
}

const PAGE_SIZE = 6;

export default function InfrastructureSection({ articles }: Props) {
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<Article | null>(null);

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

        {/* Pagination controls */}
        {totalPages > 1 && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              title="Previous page"
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
              title="Next page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Tile grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {pageArticles.map((article) => (
          <button
            key={article.id}
            onClick={() => setSelected(article)}
            className="card p-0 overflow-hidden text-left group hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            {/* Tile image or gradient placeholder */}
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

              {/* Footer */}
              <div className="mt-auto pt-3 border-t border-gray-100 space-y-1">
                {article.source && (
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <Newspaper className="w-3 h-3 text-gray-400 shrink-0" />
                    <span className="font-medium">{article.source}</span>
                  </div>
                )}
                <div className="flex items-center gap-1.5 text-xs text-gray-400">
                  <Calendar className="w-3 h-3 shrink-0" />
                  <span>{article.date}</span>
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Pagination bottom */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-6">
          <button
            onClick={() => { setPage((p) => Math.max(0, p - 1)); setSelected(null); }}
            disabled={page === 0}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" /> Previous
          </button>
          <span className="text-sm text-gray-500">
            Page {page + 1} of {totalPages}
          </span>
          <button
            onClick={() => { setPage((p) => Math.min(totalPages - 1, p + 1)); setSelected(null); }}
            disabled={page === totalPages - 1}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Next <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Detail modal */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) setSelected(null); }}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal header */}
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-start justify-between gap-3 rounded-t-2xl">
              <div>
                <span className="tag-blue text-xs mb-2 inline-block">Infrastructure</span>
                <h2 className="font-bold text-gray-900 text-lg leading-snug">
                  {selected.title}
                </h2>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors shrink-0 mt-0.5"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal image */}
            {selected.imageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={selected.imageUrl}
                alt={selected.title}
                className="w-full h-48 object-cover"
              />
            )}

            {/* Modal body */}
            <div className="px-6 py-5">
              {/* Meta row */}
              <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 mb-5 pb-4 border-b border-gray-100">
                {selected.source && (
                  <span className="flex items-center gap-1.5 font-medium text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full">
                    <Newspaper className="w-3.5 h-3.5" />
                    {selected.source}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" /> {selected.date}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> {selected.readTime}
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5" /> {selected.views.toLocaleString("en-IN")} views
                </span>
              </div>

              {/* Excerpt */}
              <p className="text-gray-600 text-sm leading-relaxed mb-4 font-medium">
                {selected.excerpt}
              </p>

              {/* Full content */}
              <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed space-y-3">
                {selected.content.split(/\n\n+/).map((para, i) => (
                  <p key={i}>{para.trim()}</p>
                ))}
              </div>

              {/* Author */}
              <p className="text-xs text-gray-400 mt-6 pt-4 border-t border-gray-100">
                By {selected.author}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
