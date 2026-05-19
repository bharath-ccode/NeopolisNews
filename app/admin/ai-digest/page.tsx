"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  Sparkles,
  Loader2,
  RefreshCw,
  CheckCircle,
  Globe,
  Flag,
  MapPin,
  Building2,
  ChevronDown,
  ChevronUp,
  Send,
} from "lucide-react";
import { LEVEL_LABELS, DIGEST_LEVELS, type DigestLevel } from "@/lib/digestSources";

interface DigestArticle {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  read_time: string;
  digest_level: DigestLevel;
  digest_date: string;
  status: "draft" | "published";
}

const LEVEL_ICONS: Record<DigestLevel, React.ElementType> = {
  international: Globe,
  national:      Flag,
  state:         MapPin,
  city:          Building2,
};

const LEVEL_COLORS: Record<DigestLevel, string> = {
  international: "bg-purple-100 text-purple-700 border-purple-200",
  national:      "bg-blue-100 text-blue-700 border-blue-200",
  state:         "bg-emerald-100 text-emerald-700 border-emerald-200",
  city:          "bg-orange-100 text-orange-700 border-orange-200",
};

function getTodayIST(): string {
  const now = new Date();
  const ist = new Date(now.getTime() + 5.5 * 60 * 60 * 1000);
  return ist.toISOString().slice(0, 10);
}

export default function AiDigestPage() {
  const [date, setDate] = useState(getTodayIST);
  const [articles, setArticles] = useState<DigestArticle[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generatingLevel, setGeneratingLevel] = useState<string | null>(null);
  const [genError, setGenError] = useState<string | null>(null);

  // Per-article state
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [feedback, setFeedback] = useState<Record<string, string>>({});
  const [regenerating, setRegenerating] = useState<Record<string, boolean>>({});
  const [publishing, setPublishing] = useState<Record<string, boolean>>({});
  const [actionMsg, setActionMsg] = useState<Record<string, string>>({});

  const fetchArticles = useCallback(async (d: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/ai-digest/list?date=${d}`);
      if (res.ok) {
        const data = await res.json();
        setArticles(data.articles ?? []);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchArticles(date);
  }, [date, fetchArticles]);

  async function handleGenerate() {
    setGenerating(true);
    setGenError(null);
    const existingLevels = new Set(articles.map((a) => a.digest_level));
    const toGenerate = DIGEST_LEVELS.filter((l) => !existingLevels.has(l));
    try {
      for (const level of toGenerate) {
        setGeneratingLevel(LEVEL_LABELS[level]);
        const res = await fetch("/api/ai-digest/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ level }),
        });
        const data = await res.json();
        if (!res.ok) { setGenError(data.error ?? `Failed at ${level}`); break; }
        // Refresh after each level so the card appears immediately
        await fetchArticles(date);
      }
    } catch {
      setGenError("Network error");
    } finally {
      setGenerating(false);
      setGeneratingLevel(null);
    }
  }

  async function handleRegenerate(articleId: string) {
    const fb = feedback[articleId]?.trim();
    if (!fb) { setActionMsg((p) => ({ ...p, [articleId]: "Please enter feedback first." })); return; }
    setRegenerating((p) => ({ ...p, [articleId]: true }));
    setActionMsg((p) => ({ ...p, [articleId]: "" }));
    try {
      const res = await fetch("/api/ai-digest/regenerate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ articleId, feedback: fb }),
      });
      const data = await res.json();
      if (!res.ok) { setActionMsg((p) => ({ ...p, [articleId]: data.error ?? "Failed" })); return; }
      // Update article in state
      setArticles((prev) =>
        prev.map((a) =>
          a.id === articleId
            ? { ...a, title: data.article.title, excerpt: data.article.excerpt, content: data.article.content, read_time: data.article.readTime ?? a.read_time }
            : a
        )
      );
      setFeedback((p) => ({ ...p, [articleId]: "" }));
      setActionMsg((p) => ({ ...p, [articleId]: "✓ Regenerated successfully" }));
    } catch {
      setActionMsg((p) => ({ ...p, [articleId]: "Network error" }));
    } finally {
      setRegenerating((p) => ({ ...p, [articleId]: false }));
    }
  }

  async function handlePublish(articleId: string) {
    setPublishing((p) => ({ ...p, [articleId]: true }));
    setActionMsg((p) => ({ ...p, [articleId]: "" }));
    try {
      const res = await fetch(`/api/ai-digest/approve/${articleId}`, { method: "POST" });
      if (!res.ok) { setActionMsg((p) => ({ ...p, [articleId]: "Failed to publish" })); return; }
      setArticles((prev) =>
        prev.map((a) => a.id === articleId ? { ...a, status: "published" } : a)
      );
      setActionMsg((p) => ({ ...p, [articleId]: "✓ Published!" }));
    } catch {
      setActionMsg((p) => ({ ...p, [articleId]: "Network error" }));
    } finally {
      setPublishing((p) => ({ ...p, [articleId]: false }));
    }
  }

  const existingLevels = new Set(articles.map((a) => a.digest_level));
  const allGenerated = DIGEST_LEVELS.every((l) => existingLevels.has(l));

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-brand-500" />
            AI News Digest
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">
            One article per level daily — review, refine, publish
          </p>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="date"
            value={date}
            max={getTodayIST()}
            onChange={(e) => setDate(e.target.value)}
            className="input text-sm py-1.5"
          />
          {!allGenerated && (
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="btn-primary text-sm py-2"
            >
              {generating
                ? <><Loader2 className="w-4 h-4 animate-spin" /> {generatingLevel ? `Writing ${generatingLevel}…` : "Starting…"}</>
                : <><Sparkles className="w-4 h-4" /> Generate Digest</>
              }
            </button>
          )}
        </div>
      </div>

      {genError && (
        <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600">{genError}</div>
      )}

      {/* Status overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {DIGEST_LEVELS.map((level) => {
          const article = articles.find((a) => a.digest_level === level);
          const Icon = LEVEL_ICONS[level];
          return (
            <div
              key={level}
              className={`card p-3 flex items-center gap-2.5 border ${
                article ? (article.status === "published" ? "border-green-200 bg-green-50" : "border-gray-200") : "border-dashed border-gray-200"
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${article?.status === "published" ? "text-green-600" : "text-gray-400"}`} />
              <div className="min-w-0">
                <p className="text-xs font-semibold text-gray-700 truncate">{LEVEL_LABELS[level]}</p>
                <p className={`text-xs ${
                  !article ? "text-gray-400" :
                  article.status === "published" ? "text-green-600 font-medium" : "text-amber-600"
                }`}>
                  {!article ? "Not generated" : article.status === "published" ? "Published" : "Draft"}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-12 text-gray-400">
          <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading…
        </div>
      )}

      {/* Article cards */}
      {!loading && articles.length === 0 && (
        <div className="card p-10 text-center">
          <Sparkles className="w-8 h-8 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No digest generated for {date}</p>
          <p className="text-sm text-gray-400 mt-1">Click "Generate Digest" to create today&apos;s articles.</p>
        </div>
      )}

      <div className="space-y-4">
        {DIGEST_LEVELS.map((level) => {
          const article = articles.find((a) => a.digest_level === level);
          if (!article) return null;
          const Icon = LEVEL_ICONS[level];
          const isExpanded = expanded[article.id];
          const isRegenerating = regenerating[article.id];
          const isPublishing = publishing[article.id];
          const msg = actionMsg[article.id];
          const isPublished = article.status === "published";

          return (
            <div key={level} className="card overflow-hidden">
              {/* Card header */}
              <div className="p-5 border-b border-gray-100">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border shrink-0 ${LEVEL_COLORS[level]}`}>
                      <Icon className="w-3.5 h-3.5" />
                      {LEVEL_LABELS[level]}
                    </span>
                    {isPublished && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 border border-green-200 shrink-0">
                        <CheckCircle className="w-3 h-3" /> Published
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-gray-400 shrink-0">{article.read_time}</span>
                </div>
                <h3 className="font-bold text-gray-900 mt-3 leading-snug">{article.title}</h3>
                <p className="text-sm text-gray-500 mt-1.5 leading-relaxed">{article.excerpt}</p>
              </div>

              {/* Toggle content */}
              <button
                onClick={() => setExpanded((p) => ({ ...p, [article.id]: !isExpanded }))}
                className="w-full flex items-center justify-between px-5 py-2.5 text-xs text-gray-500 hover:bg-gray-50 transition-colors"
              >
                <span>{isExpanded ? "Hide" : "Show"} full article</span>
                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {isExpanded && (
                <div
                  className="px-5 pb-4 text-sm text-gray-700 leading-relaxed border-b border-gray-100
                    [&_h2]:text-base [&_h2]:font-bold [&_h2]:text-gray-900 [&_h2]:mt-4 [&_h2]:mb-2
                    [&_p]:mb-3 [&_ul]:pl-5 [&_ul]:space-y-1 [&_li]:list-disc"
                  dangerouslySetInnerHTML={{ __html: article.content }}
                />
              )}

              {/* Feedback & actions */}
              {!isPublished && (
                <div className="p-4 bg-gray-50 space-y-3">
                  <textarea
                    value={feedback[article.id] ?? ""}
                    onChange={(e) => setFeedback((p) => ({ ...p, [article.id]: e.target.value }))}
                    placeholder="Feedback for regeneration — e.g. 'focus more on IT salary impact' or 'be more concise'…"
                    rows={2}
                    className="w-full input text-sm resize-none"
                  />
                  {msg && (
                    <p className={`text-xs ${msg.startsWith("✓") ? "text-green-600" : "text-red-500"}`}>
                      {msg}
                    </p>
                  )}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleRegenerate(article.id)}
                      disabled={isRegenerating || isPublishing}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60 transition-colors"
                    >
                      {isRegenerating
                        ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Regenerating…</>
                        : <><RefreshCw className="w-3.5 h-3.5" /> Regenerate</>
                      }
                    </button>
                    <button
                      onClick={() => handlePublish(article.id)}
                      disabled={isRegenerating || isPublishing}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm font-semibold disabled:opacity-60 transition-colors"
                    >
                      {isPublishing
                        ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Publishing…</>
                        : <><Send className="w-3.5 h-3.5" /> Publish</>
                      }
                    </button>
                  </div>
                </div>
              )}

              {isPublished && (
                <div className="px-5 py-3 bg-green-50 border-t border-green-100 flex items-center justify-between">
                  <span className="text-xs text-green-700 font-medium flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4" /> Published successfully
                  </span>
                  <Link
                    href={`/news/${article.id}`}
                    target="_blank"
                    className="text-xs text-green-700 underline hover:text-green-900"
                  >
                    View article →
                  </Link>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Info box */}
      <div className="card p-4 border-dashed text-xs text-gray-400 leading-relaxed">
        <strong className="text-gray-600">How it works:</strong> At 4 AM IST daily, the system fetches headlines from 8 RSS feeds across 4 levels and asks Claude to write one article per level. You review each, optionally give feedback to refine, then publish. Only the articles you approve go live.
        <br />
        <strong className="text-gray-600 mt-2 block">SQL needed (one-time):</strong>
        <code className="text-gray-500 block mt-1 bg-gray-50 p-2 rounded">
          ALTER TABLE articles ADD COLUMN IF NOT EXISTS digest_date date;<br />
          ALTER TABLE articles ADD COLUMN IF NOT EXISTS digest_level text;<br />
          ALTER TABLE articles ADD COLUMN IF NOT EXISTS digest_headlines jsonb;
        </code>
      </div>
    </div>
  );
}
