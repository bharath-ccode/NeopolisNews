"use client";

import { useEffect, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Save,
  Send,
  Loader2,
  AlertCircle,
  Megaphone,
} from "lucide-react";
import { useBuilderAuth } from "@/context/BuilderAuthContext";
import { getProjectsByBuilderId, Project } from "@/lib/projectsStore";
import { createArticle, ArticleStatus } from "@/lib/newsStore";

function formatDisplayDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function BuilderNewLaunchPage() {
  const { builder }  = useBuilderAuth();
  const router       = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);

  // Form state
  const [projectId, setProjectId] = useState("");
  const [title, setTitle]         = useState("");
  const [excerpt, setExcerpt]     = useState("");
  const [content, setContent]     = useState("");
  const [imageUrl, setImageUrl]   = useState("");
  const [readTime, setReadTime]   = useState("4 min");
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState("");

  useEffect(() => {
    if (!builder) return;
    getProjectsByBuilderId(builder.id).then(setProjects);
  }, [builder]);

  const inputCls =
    "w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition";

  async function handleSubmit(e: FormEvent, status: ArticleStatus) {
    e.preventDefault();
    setError("");
    if (!title.trim()) { setError("Title is required."); return; }
    if (!excerpt.trim()) { setError("Summary is required."); return; }
    if (!content.trim()) { setError("Content is required."); return; }

    setSaving(true);
    try {
      await createArticle({
        title:    title.trim(),
        excerpt:  excerpt.trim(),
        content:  content.trim(),
        category: "launches",
        tag:      "New Launch",
        tagColor: "tag-green",
        author:   builder!.builderName,
        date:     formatDisplayDate(new Date().toISOString()),
        readTime: readTime.trim(),
        imageUrl: imageUrl.trim() || undefined,
        sponsored: false,
        status,
        views:    0,
        projectId: projectId || null,
        builderId: builder!.id,
      });
      router.push("/builder");
    } catch {
      setError("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <div className="flex items-center gap-2">
            <Megaphone className="w-4 h-4 text-green-600" />
            <h1 className="text-xl font-extrabold text-gray-900">
              Announce New Launch
            </h1>
          </div>
          <p className="text-sm text-gray-400 mt-0.5">
            This will appear under the &ldquo;New Launches&rdquo; section in News.
          </p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-100 text-red-700 text-sm rounded-lg px-4 py-3">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      <form className="space-y-5">
        <div className="card p-5 space-y-4">
          <h2 className="font-semibold text-gray-900 text-sm">Launch Details</h2>

          {/* Link to project */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Linked Project (optional)
            </label>
            <select
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className={inputCls}
            >
              <option value="">— None / Standalone announcement —</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.projectName}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-400 mt-1">
              Link to an existing project or leave blank for a standalone launch announcement.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Headline <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Phase 3 Towers Open for Pre-Booking — Prices from ₹85L"
              className={inputCls}
              maxLength={200}
            />
            <p className="text-xs text-gray-400 mt-1 text-right">{title.length}/200</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Summary <span className="text-red-500">*</span>
            </label>
            <textarea
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="Short summary shown in article cards…"
              rows={2}
              className={inputCls}
              maxLength={300}
            />
            <p className="text-xs text-gray-400 mt-1 text-right">{excerpt.length}/300</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Full Announcement <span className="text-red-500">*</span>
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Describe the launch — units available, pricing, payment plans, amenities, booking process…"
              rows={10}
              className={inputCls + " resize-y font-mono text-xs leading-relaxed"}
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Image URL (optional)
              </label>
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://…"
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Read Time
              </label>
              <input
                type="text"
                value={readTime}
                onChange={(e) => setReadTime(e.target.value)}
                placeholder="e.g. 4 min"
                className={inputCls}
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex gap-3">
          <button
            type="button"
            disabled={saving}
            onClick={(e) => handleSubmit(e as unknown as FormEvent, "draft")}
            className="btn-secondary flex-1 justify-center disabled:opacity-60"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save as Draft
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={(e) => handleSubmit(e as unknown as FormEvent, "published")}
            className="btn-primary flex-1 justify-center disabled:opacity-60"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            Publish Launch
          </button>
        </div>
      </form>
    </div>
  );
}
