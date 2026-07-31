"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, CheckCircle2, Eye, Languages, RefreshCw, Save } from "lucide-react";

const TELUGU_FONT = {
  fontFamily: 'var(--font-telugu), "Noto Sans Telugu", "Nirmala UI", sans-serif',
};

interface EnglishArticle {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  status: string;
}

export default function TeluguReviewPage() {
  const params = useParams<{ id: string }>();
  const articleId = params.id;

  const [article, setArticle] = useState<EnglishArticle | null>(null);
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [hasTranslation, setHasTranslation] = useState(false);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<"save" | "regenerate" | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [showPreview, setShowPreview] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/admin/articles/${articleId}/translation`);
    if (res.ok) {
      const json = await res.json();
      setArticle(json.article);
      if (json.translation) {
        setTitle(json.translation.title);
        setExcerpt(json.translation.excerpt);
        setContent(json.translation.content);
        setUpdatedAt(json.translation.updated_at ?? null);
        setHasTranslation(true);
      }
    } else {
      setError("Could not load the article.");
    }
    setLoading(false);
  }, [articleId]);

  useEffect(() => { load(); }, [load]);

  async function handleSave() {
    setBusy("save");
    setMessage("");
    setError("");
    const res = await fetch(`/api/admin/articles/${articleId}/translation`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, excerpt, content }),
    });
    if (res.ok) {
      setMessage("Telugu translation saved.");
      setHasTranslation(true);
    } else {
      const json = await res.json().catch(() => ({}));
      setError(json.error ?? "Save failed.");
    }
    setBusy(null);
  }

  async function handleRegenerate() {
    setBusy("regenerate");
    setMessage("");
    setError("");
    const res = await fetch(`/api/admin/articles/${articleId}/translation`, {
      method: "POST",
    });
    if (res.ok) {
      const json = await res.json();
      setTitle(json.translation.title);
      setExcerpt(json.translation.excerpt);
      setContent(json.translation.content);
      setHasTranslation(true);
      setMessage("Regenerated from the English original — review and save.");
    } else {
      const json = await res.json().catch(() => ({}));
      setError(json.error ?? "Translation failed — check GOOGLE_TRANSLATE_API_KEY.");
    }
    setBusy(null);
  }

  if (loading) {
    return <div className="text-gray-400 text-sm py-12 text-center">Loading…</div>;
  }
  if (!article) {
    return <div className="text-red-600 text-sm py-12 text-center">{error || "Article not found."}</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            href="/admin/news"
            className="inline-flex items-center gap-1.5 text-gray-400 hover:text-gray-600 text-sm"
          >
            <ArrowLeft className="w-4 h-4" /> News Articles
          </Link>
          <h2 className="text-xl font-bold text-gray-900 mt-1 flex items-center gap-2">
            <Languages className="w-5 h-5 text-brand-600" /> Telugu Review
          </h2>
          <p className="text-gray-500 text-sm mt-0.5 line-clamp-1">{article.title}</p>
          {updatedAt && (
            <p className="text-gray-400 text-xs mt-0.5">
              Last updated {new Date(updatedAt).toLocaleString("en-IN")}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleRegenerate}
            disabled={busy !== null}
            className="btn-secondary text-sm py-2 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${busy === "regenerate" ? "animate-spin" : ""}`} />
            {hasTranslation ? "Regenerate" : "Translate now"}
          </button>
          <button
            onClick={handleSave}
            disabled={busy !== null || !title.trim()}
            className="btn-primary text-sm py-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" /> Save
          </button>
        </div>
      </div>

      {message && (
        <div className="flex items-center gap-2 bg-green-50 border border-green-100 text-green-700 text-sm rounded-lg px-4 py-2.5">
          <CheckCircle2 className="w-4 h-4 shrink-0" /> {message}
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-100 text-red-700 text-sm rounded-lg px-4 py-2.5">
          {error}
        </div>
      )}

      {!hasTranslation && (
        <div className="card p-6 text-sm text-gray-500">
          No Telugu translation exists for this article yet. Click{" "}
          <span className="font-semibold text-gray-700">Translate now</span> to generate one
          with Google Translate, then review and save.
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* English original (read-only reference) */}
        <div className="card p-6 space-y-4">
          <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wide">
            English original {article.status !== "published" && (
              <span className="ml-1 text-xs font-medium text-yellow-600 normal-case">(draft)</span>
            )}
          </h3>
          <p className="font-semibold text-gray-900">{article.title}</p>
          <p className="text-sm text-gray-600">{article.excerpt}</p>
          <div
            className="prose prose-sm max-w-none text-gray-700 border-t border-gray-100 pt-4
              [&_h2]:text-base [&_h2]:font-bold [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />
        </div>

        {/* Telugu editor */}
        <div className="space-y-4">
          <div className="card p-6 space-y-4">
            <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wide">
              Telugu translation
            </h3>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Title</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                lang="te"
                style={TELUGU_FONT}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Excerpt</label>
              <textarea
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                rows={3}
                lang="te"
                style={TELUGU_FONT}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Content (HTML)
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={14}
                lang="te"
                style={TELUGU_FONT}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          <div className="card p-6">
            <button
              onClick={() => setShowPreview((v) => !v)}
              className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 hover:text-brand-600"
            >
              <Eye className="w-4 h-4" /> {showPreview ? "Hide preview" : "Show preview"}
            </button>
            {showPreview && (
              <div
                lang="te"
                style={TELUGU_FONT}
                className="prose prose-sm max-w-none text-gray-700 mt-4 border-t border-gray-100 pt-4
                  [&_h2]:text-base [&_h2]:font-bold [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5"
                dangerouslySetInnerHTML={{ __html: content }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
