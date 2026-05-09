"use client";

import { useEffect, useState, useRef, FormEvent, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft, Save, Send, Loader2, AlertCircle,
  HardHat, Upload, X, Youtube,
} from "lucide-react";
import { useBuilderAuth } from "@/context/BuilderAuthContext";
import { getProjectsByBuilderId, Project } from "@/lib/projectsStore";
import { CATEGORY_META, extractYouTubeId } from "@/lib/newsStore";

function formatDisplayDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

function CreateUpdateForm() {
  const { builder } = useBuilderAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedProjectId = searchParams.get("project") ?? "";

  const [projects, setProjects] = useState<Project[]>([]);
  const [projectId, setProjectId] = useState(preselectedProjectId);

  const [title, setTitle]     = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [readTime, setReadTime] = useState("3 min");

  const [saving, setSaving]       = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError]         = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!builder) return;
    getProjectsByBuilderId(builder.id).then(setProjects);
  }, [builder]);

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", "construction-updates");
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

  async function handleSubmit(e: FormEvent, status: "draft" | "published") {
    e.preventDefault();
    setError("");
    if (!title.trim())   { setError("Headline is required.");   return; }
    if (!excerpt.trim()) { setError("Summary is required.");    return; }
    if (!content.trim()) { setError("Full update is required."); return; }

    setSaving(true);
    try {
      const meta = CATEGORY_META["construction"];
      const res = await fetch("/api/articles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title:     title.trim(),
          excerpt:   excerpt.trim(),
          content:   content.trim(),
          category:  "construction",
          tag:       meta.tag,
          tagColor:  meta.tagColor,
          author:    builder!.builderName,
          date:      formatDisplayDate(new Date().toISOString()),
          readTime:  readTime.trim(),
          imageUrl:  imageUrl.trim() || null,
          videoUrl:  videoUrl.trim() || null,
          sponsored: false,
          status,
          projectId: projectId || null,
          builderId: builder!.id,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed to save");
      router.push("/builder/updates");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  const inputCls =
    "w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition";

  const selectedProject = projects.find((p) => p.id === projectId);
  const ytId = videoUrl.trim() ? extractYouTubeId(videoUrl.trim()) : null;

  return (
    <div className="max-w-2xl space-y-6">
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
          <div className="flex items-center gap-2">
            <HardHat className="w-4 h-4 text-orange-500" />
            <h1 className="text-xl font-extrabold text-gray-900">Post Construction Update</h1>
          </div>
          <p className="text-sm text-gray-400 mt-0.5">
            {selectedProject
              ? `Project: ${selectedProject.projectName}`
              : "Select a project or post a general update"}
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
        {/* Project picker */}
        <div className="card p-5 space-y-4">
          <h2 className="font-semibold text-gray-900 text-sm">Project (optional)</h2>
          <select
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            className={inputCls}
          >
            <option value="">— General update (no specific project) —</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>{p.projectName}</option>
            ))}
          </select>
        </div>

        {/* Content */}
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
              placeholder={selectedProject
                ? `e.g. ${selectedProject.projectName} reaches 20th floor slab`
                : "e.g. Work begins on Phase 2 towers"}
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
              placeholder="Short summary shown in news cards…"
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
              placeholder="Describe the progress in detail. Include floor completions, milestones, next steps, timelines…"
              rows={12}
              className={`${inputCls} resize-y font-mono text-xs leading-relaxed`}
            />
          </div>
        </div>

        {/* Media */}
        <div className="card p-5 space-y-4">
          <h2 className="font-semibold text-gray-900 text-sm">Media (optional)</h2>

          {/* Image upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Photo / Site Image
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
                <img src={imageUrl} alt="Update" className="w-full h-48 object-cover" />
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
                className="w-full flex flex-col items-center gap-2 border-2 border-dashed border-gray-200 rounded-lg py-8 text-gray-400 hover:border-orange-400 hover:text-orange-500 transition-colors disabled:opacity-60"
              >
                {uploading
                  ? <Loader2 className="w-6 h-6 animate-spin" />
                  : <Upload className="w-6 h-6" />}
                <span className="text-sm font-medium">
                  {uploading ? "Uploading…" : "Click to upload site photo"}
                </span>
                <span className="text-xs">JPEG, PNG or WebP · max 5 MB</span>
              </button>
            )}
          </div>

          {/* YouTube */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              <Youtube className="inline w-3.5 h-3.5 mr-1 text-red-500" />
              YouTube / Shorts URL
            </label>
            <input
              type="url"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="https://youtu.be/… or https://youtube.com/shorts/…"
              className={inputCls}
            />
            {videoUrl.trim() && (
              ytId
                ? <p className="text-xs text-green-600 mt-1">✓ Video ID: {ytId}</p>
                : <p className="text-xs text-red-500 mt-1">Could not detect a YouTube video ID</p>
            )}
          </div>

          {/* Read time */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Read Time
            </label>
            <input
              type="text"
              value={readTime}
              onChange={(e) => setReadTime(e.target.value)}
              placeholder="e.g. 2 min"
              className={`${inputCls} max-w-[160px]`}
            />
          </div>
        </div>

        {/* Actions */}
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

export default function CreateUpdatePage() {
  return (
    <Suspense>
      <CreateUpdateForm />
    </Suspense>
  );
}
