"use client";

import { useState, useRef, FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  Save,
  Send,
  ArrowLeft,
  Image as ImageIcon,
  AlertCircle,
  Loader2,
  Newspaper,
  Upload,
  X,
  Youtube,
  Sparkles,
  LayoutTemplate,
  Check,
} from "lucide-react";
import clsx from "clsx";
import {
  Article,
  ArticleCategory,
  ArticleStatus,
  CATEGORY_META,
  extractYouTubeId,
} from "@/lib/newsStore";

interface Props {
  article?: Article;
}

// Manually-authored topics only. "editorial" (Editor's Desk) and "digest"
// (daily AI digests) are generated categories — locked in the form, never
// assignable to a manual article.
const CATEGORIES: ArticleCategory[] = [
  "construction",
  "launches",
  "infrastructure",
  "community",
];

const DIGEST_LEVEL_LABELS: Record<string, string> = {
  international: "International",
  national:      "National",
  state:         "State (Telangana)",
  city:          "Hyderabad",
};

function formatDisplayDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function ArticleForm({ article }: Props) {
  const router = useRouter();
  const isEdit = !!article;

  const [title, setTitle]       = useState(article?.title ?? "");
  const [excerpt, setExcerpt]   = useState(article?.excerpt ?? "");
  const [content, setContent]   = useState(article?.content ?? "");
  const [category, setCategory] = useState<ArticleCategory>(
    article?.category ?? "construction"
  );
  const [author, setAuthor]     = useState(article?.author ?? "NeopolisNews Staff");
  const [source, setSource]     = useState(article?.source ?? "");
  const [readTime, setReadTime] = useState(article?.readTime ?? "3 min");
  const [imageUrl, setImageUrl] = useState(article?.imageUrl ?? "");
  const [videoUrl, setVideoUrl] = useState(article?.videoUrl ?? "");
  const [sponsored, setSponsored] = useState(article?.sponsored ?? false);
  const [status, setStatus]     = useState<ArticleStatus>(
    article?.status ?? "draft"
  );

  const [saving, setSaving]       = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError]         = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // AI cover generation — keep both candidates so the editor can compare & switch
  const [genBusy, setGenBusy] = useState<"card" | "ai" | null>(null);
  const [cardUrl, setCardUrl] = useState("");
  const [aiUrl, setAiUrl]     = useState("");

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", "news");
      fd.append("bucket", "news-media");
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Upload failed");
      setImageUrl(json.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Image upload failed");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function generateCard() {
    if (!title.trim()) { setError("Add a title before generating a cover."); return; }
    setGenBusy("card");
    setError("");
    try {
      const res = await fetch("/api/admin/articles/generate-card", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim(), tag: displayTag }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Card generation failed");
      setCardUrl(json.url);
      setImageUrl(json.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Card generation failed");
    } finally {
      setGenBusy(null);
    }
  }

  async function generateAiImage() {
    if (!title.trim()) { setError("Add a title before generating a cover."); return; }
    setGenBusy("ai");
    setError("");
    try {
      const res = await fetch("/api/admin/articles/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim(), excerpt: excerpt.trim(), content: content.trim() }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Image generation failed");
      setAiUrl(json.url);
      setImageUrl(json.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Image generation failed");
    } finally {
      setGenBusy(null);
    }
  }

  const meta = CATEGORY_META[category];
  const isEditorial = category === "editorial";
  const isDigest = category === "digest";
  // Generated articles keep the identity the pipeline gave them: digests keep
  // their level tag (World/India/Telangana/Hyderabad), editorials stay editorial.
  const isGenerated = isDigest || isEditorial;
  const displayTag = isDigest ? article?.tag ?? meta.tag : meta.tag;
  const displayTagColor = isDigest ? article?.tagColor ?? meta.tagColor : meta.tagColor;

  async function handleSubmit(e: FormEvent, submitStatus: ArticleStatus) {
    e.preventDefault();
    setError("");

    if (!title.trim()) { setError("Title is required."); return; }
    if (!excerpt.trim()) { setError("Excerpt is required."); return; }
    if (!content.trim()) { setError("Content is required."); return; }

    setSaving(true);
    try {
      const payload = {
        title:    title.trim(),
        excerpt:  excerpt.trim(),
        content:  content.trim(),
        category,
        tag:      displayTag,
        tagColor: displayTagColor,
        author:   author.trim(),
        source:   source.trim() || null,
        readTime: readTime.trim(),
        imageUrl: imageUrl.trim() || undefined,
        videoUrl: videoUrl.trim() || null,
        sponsored,
        status:   submitStatus,
        views:    article?.views ?? 0,
        date:     formatDisplayDate(new Date().toISOString()),
      };

      let res: Response;
      if (isEdit) {
        res = await fetch("/api/articles", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: article.id, ...payload }),
        });
      } else {
        res = await fetch("/api/articles", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error ?? "Save failed");
      }

      router.push("/admin/news");
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  const inputCls =
    "w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition";

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            {isEdit ? "Edit Article" : "New Article"}
          </h2>
          <p className="text-gray-500 text-sm">
            {isEdit ? "Update the article details below." : "Fill in the details to create a new article."}
          </p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      <form>
        <div className="space-y-6">
          {/* Title */}
          <div className="card p-6 space-y-5">
            <h3 className="font-semibold text-gray-900 text-sm uppercase tracking-wide text-gray-500">Content</h3>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter article title…"
                className={inputCls}
                maxLength={200}
              />
              <p className="text-xs text-gray-400 mt-1 text-right">
                {title.length}/200
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Excerpt <span className="text-red-500">*</span>
              </label>
              <textarea
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                placeholder="Short summary shown in article cards…"
                rows={2}
                className={inputCls}
                maxLength={300}
              />
              <p className="text-xs text-gray-400 mt-1 text-right">
                {excerpt.length}/300
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Full Content <span className="text-red-500">*</span>
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write the full article content here. Use blank lines to separate paragraphs."
                rows={12}
                className={clsx(inputCls, "resize-y font-mono text-xs leading-relaxed")}
              />
            </div>
          </div>

          {/* Meta */}
          <div className="card p-6 space-y-5">
            <h3 className="font-semibold text-gray-900 text-sm uppercase tracking-wide text-gray-500">Details</h3>

            <div className="grid sm:grid-cols-2 gap-4">
              {/* Category */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Category <span className="text-red-500">*</span>
                </label>
                {isGenerated ? (
                  <>
                    <div className={`${inputCls} bg-gray-50 text-gray-500 cursor-not-allowed select-none`}>
                      {isDigest
                        ? `Daily Digest — ${
                            DIGEST_LEVEL_LABELS[article?.digestLevel ?? ""] ?? displayTag
                          }`
                        : "Editorial (Editor's Desk)"}
                    </div>
                    <p className="text-[11px] text-gray-400 mt-1.5">
                      Set by the AI news pipeline — generated articles can&apos;t be
                      re-filed under a local topic.
                    </p>
                  </>
                ) : (
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ArticleCategory)}
                    className={inputCls}
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {CATEGORY_META[c].label}
                      </option>
                    ))}
                  </select>
                )}
                <div className="mt-2">
                  <span className={`badge text-xs ${displayTagColor}`}>
                    {displayTag}
                  </span>
                </div>
              </div>

              {/* Author */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Author
                </label>
                <input
                  type="text"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  placeholder="e.g. NeopolisNews Staff"
                  className={inputCls}
                />
              </div>

              {/* Source */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <Newspaper className="inline w-3.5 h-3.5 mr-1 text-gray-400" />
                  News Source
                </label>
                <input
                  type="text"
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  placeholder="e.g. Deccan Chronicle"
                  className={inputCls}
                />
              </div>

              {/* Read time */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Read Time
                </label>
                <input
                  type="text"
                  value={readTime}
                  onChange={(e) => setReadTime(e.target.value)}
                  placeholder="e.g. 3 min"
                  className={inputCls}
                />
              </div>

              {/* Image upload */}
              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <ImageIcon className="inline w-3.5 h-3.5 mr-1 text-gray-400" />
                  Article Image
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handleImageUpload}
                />
                {imageUrl ? (
                  <div className="relative rounded-lg overflow-hidden border border-gray-200">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={imageUrl} alt="Article" className="w-full h-48 object-cover" />
                    <button
                      type="button"
                      onClick={() => setImageUrl("")}
                      className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="w-full flex flex-col items-center gap-2 border-2 border-dashed border-gray-200 rounded-lg py-8 text-gray-400 hover:border-brand-400 hover:text-brand-500 transition-colors disabled:opacity-60"
                  >
                    {uploading
                      ? <Loader2 className="w-6 h-6 animate-spin" />
                      : <Upload className="w-6 h-6" />}
                    <span className="text-sm font-medium">
                      {uploading ? "Uploading…" : "Click to upload image"}
                    </span>
                    <span className="text-xs">JPEG, PNG or WebP · max 5 MB</span>
                  </button>
                )}

                {/* Generate a cover — headline card or AI illustration */}
                <div className="mt-3 rounded-lg border border-gray-100 bg-gray-50 p-3">
                  <div className="flex items-center gap-1.5 mb-2">
                    <Sparkles className="w-3.5 h-3.5 text-brand-500" />
                    <span className="text-xs font-semibold text-gray-600">Generate a cover</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={generateCard}
                      disabled={genBusy !== null}
                      className={clsx(
                        "inline-flex items-center gap-1.5 text-sm font-medium px-3 py-2 rounded-lg border transition-colors disabled:opacity-60",
                        !isEditorial
                          ? "border-brand-300 bg-brand-50 text-brand-700 hover:bg-brand-100"
                          : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                      )}
                    >
                      {genBusy === "card"
                        ? <Loader2 className="w-4 h-4 animate-spin" />
                        : <LayoutTemplate className="w-4 h-4" />}
                      Headline card
                    </button>
                    <button
                      type="button"
                      onClick={generateAiImage}
                      disabled={genBusy !== null}
                      className={clsx(
                        "inline-flex items-center gap-1.5 text-sm font-medium px-3 py-2 rounded-lg border transition-colors disabled:opacity-60",
                        isEditorial
                          ? "border-brand-300 bg-brand-50 text-brand-700 hover:bg-brand-100"
                          : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                      )}
                    >
                      {genBusy === "ai"
                        ? <Loader2 className="w-4 h-4 animate-spin" />
                        : <Sparkles className="w-4 h-4" />}
                      AI illustration
                    </button>
                  </div>
                  <p className="text-[11px] text-gray-400 mt-2">
                    {isEditorial
                      ? "AI illustration is recommended for editorials. Illustrative art only — labelled, never a real photo."
                      : "Headline card is recommended for news. Generate both to compare, then pick one below."}
                  </p>

                  {(cardUrl || aiUrl) && (
                    <div className="grid grid-cols-2 gap-2 mt-3">
                      {[
                        { url: cardUrl, label: "Headline card", icon: LayoutTemplate },
                        { url: aiUrl,   label: "AI illustration", icon: Sparkles },
                      ]
                        .filter((c) => c.url)
                        .map(({ url, label, icon: Icon }) => {
                          const active = imageUrl === url;
                          return (
                            <button
                              key={label}
                              type="button"
                              onClick={() => setImageUrl(url)}
                              className={clsx(
                                "relative rounded-lg overflow-hidden border-2 text-left transition-colors",
                                active ? "border-brand-500" : "border-transparent hover:border-gray-200"
                              )}
                            >
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={url} alt={label} className="w-full h-24 object-cover" />
                              <span className="flex items-center gap-1 text-[11px] font-medium text-gray-600 px-2 py-1">
                                <Icon className="w-3 h-3" /> {label}
                              </span>
                              {active && (
                                <span className="absolute top-1.5 right-1.5 bg-brand-600 text-white rounded-full p-0.5">
                                  <Check className="w-3 h-3" />
                                </span>
                              )}
                            </button>
                          );
                        })}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* YouTube video */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Youtube className="inline w-3.5 h-3.5 mr-1 text-red-500" />
                YouTube Video URL <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <input
                type="url"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=… or https://youtu.be/…"
                className={inputCls}
              />
              {videoUrl.trim() && (() => {
                const id = extractYouTubeId(videoUrl.trim());
                return id ? (
                  <p className="text-xs text-green-600 mt-1">✓ Video ID detected: {id}</p>
                ) : (
                  <p className="text-xs text-red-500 mt-1">Could not detect a YouTube video ID from this URL</p>
                );
              })()}
            </div>

            {/* Sponsored toggle */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-yellow-50 border border-yellow-100">
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Sponsored Content
                </p>
                <p className="text-xs text-gray-500">
                  Mark this as a paid/sponsored article
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSponsored((v) => !v)}
                className={clsx(
                  "relative inline-flex h-5 w-9 items-center rounded-full transition-colors",
                  sponsored ? "bg-yellow-500" : "bg-gray-300"
                )}
              >
                <span
                  className={clsx(
                    "inline-block h-4 w-4 rounded-full bg-white shadow transform transition-transform",
                    sponsored ? "translate-x-4" : "translate-x-0.5"
                  )}
                />
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              type="button"
              disabled={saving}
              onClick={(e) => handleSubmit(e as unknown as FormEvent, "draft")}
              className="btn-secondary flex-1 justify-center disabled:opacity-60"
            >
              {saving && status === "draft" ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Save as Draft
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={(e) => handleSubmit(e as unknown as FormEvent, "published")}
              className="btn-primary flex-1 justify-center disabled:opacity-60"
            >
              {saving && status === "published" ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              {isEdit ? "Update & Publish" : "Publish Article"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
