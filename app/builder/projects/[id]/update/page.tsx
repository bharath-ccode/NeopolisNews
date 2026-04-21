"use client";

import { useEffect, useState, FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Save,
  Send,
  Loader2,
  AlertCircle,
  HardHat,
} from "lucide-react";
import { useBuilderAuth } from "@/context/BuilderAuthContext";
import { getProjectById, Project } from "@/lib/projectsStore";
import { createArticle, ArticleStatus } from "@/lib/newsStore";

function formatDisplayDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function BuilderConstructionUpdatePage() {
  const { builder }  = useBuilderAuth();
  const router       = useRouter();
  const { id }       = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null | undefined>(undefined);

  // Form state
  const [title, setTitle]     = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [readTime, setReadTime] = useState("3 min");
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState("");

  useEffect(() => {
    if (!id) return;
    getProjectById(id).then(setProject);
  }, [id]);

  if (project === undefined) {
    return (
      <div className="text-sm text-gray-400 py-12 text-center">Loading…</div>
    );
  }

  if (!project || project.builderId !== builder?.id) {
    return (
      <div className="py-12 text-center text-sm text-red-500">
        Project not found or access denied.
      </div>
    );
  }

  const inputCls =
    "w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition";

  async function handleSubmit(e: FormEvent, status: ArticleStatus) {
    e.preventDefault();
    setError("");
    if (!title.trim()) { setError("Title is required."); return; }
    if (!excerpt.trim()) { setError("Excerpt is required."); return; }
    if (!content.trim()) { setError("Content is required."); return; }

    setSaving(true);
    try {
      await createArticle({
        title:    title.trim(),
        excerpt:  excerpt.trim(),
        content:  content.trim(),
        category: "construction",
        tag:      "Construction",
        tagColor: "tag-orange",
        author:   builder!.builderName,
        date:     formatDisplayDate(new Date().toISOString()),
        readTime: readTime.trim(),
        imageUrl: imageUrl.trim() || undefined,
        sponsored: false,
        status,
        views:    0,
        projectId: project!.id,
        builderId: builder!.id,
      });
      router.push("/builder/projects");
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
            <HardHat className="w-4 h-4 text-orange-500" />
            <h1 className="text-xl font-extrabold text-gray-900">
              Construction Update
            </h1>
          </div>
          <p className="text-sm text-gray-400 mt-0.5">
            Project: <span className="font-medium text-gray-600">{project.projectName}</span>
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
          <h2 className="font-semibold text-gray-900 text-sm">Update Details</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Headline <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={`e.g. ${project.projectName} reaches 20th floor slab`}
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
              Full Update <span className="text-red-500">*</span>
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Describe the construction progress in detail. Include floor numbers, milestones, photos context, next steps…"
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
                placeholder="e.g. 3 min"
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
            Publish Update
          </button>
        </div>
      </form>
    </div>
  );
}
