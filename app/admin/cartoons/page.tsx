"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  PenTool, Loader2, Plus, Trash2, ImagePlus, X, Trophy,
  Eye, EyeOff, ExternalLink, CheckCircle2, Sparkles, RefreshCw,
} from "lucide-react";
import clsx from "clsx";

interface Cartoon {
  id: string;
  title: string;
  image_url: string;
  caption: string | null;
  artist_name: string;
  publish_date: string;
  is_contest: boolean;
  winner_name: string | null;
  status: "draft" | "published";
}
interface CaptionEntry {
  id: string;
  author_name: string;
  body: string;
}

const INPUT = "w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400";

export default function AdminCartoonsPage() {
  const [cartoons, setCartoons] = useState<Cartoon[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");
  const [busy, setBusy]         = useState<string | null>(null);

  // New cartoon form
  const [title, setTitle]       = useState("");
  const [caption, setCaption]   = useState("");
  const [artist, setArtist]     = useState("");
  const [date, setDate]         = useState(new Date().toISOString().split("T")[0]);
  const [isContest, setIsContest] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving]     = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Generate from headlines
  const [generating, setGenerating]   = useState(false);
  const [generated, setGenerated]     = useState(false);
  const [genUrl, setGenUrl]           = useState("");
  const [genNotes, setGenNotes]       = useState("");

  // Winner picking
  const [pickingFor, setPickingFor] = useState<string | null>(null);
  const [entries, setEntries]       = useState<CaptionEntry[]>([]);

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/cartoons").catch(() => null);
    if (res?.ok) {
      const data = await res.json();
      if (Array.isArray(data)) setCartoons(data);
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/cartoons/upload", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Upload failed");
      setImageUrl(json.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Image upload failed");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function generateFromHeadlines() {
    setGenerating(true);
    setError("");
    const res = await fetch("/api/admin/cartoons/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: genUrl.trim() || undefined, notes: genNotes.trim() || undefined }),
    }).catch(() => null);
    if (!res?.ok) {
      const j = res ? await res.json().catch(() => ({})) : {};
      setError((j as { error?: string }).error ?? "Failed to generate.");
      setGenerating(false);
      return;
    }
    const data = await res.json();
    setTitle(data.title ?? "");
    setCaption(data.caption ?? "");
    setImageUrl(data.image_url ?? "");
    setIsContest(false);
    setGenerated(true);
    setGenerating(false);
  }

  async function save(publish: boolean) {
    setSaving(true);
    setError("");
    const res = await fetch("/api/admin/cartoons", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title, image_url: imageUrl,
        caption: isContest ? undefined : caption,
        artist_name: artist || undefined,
        publish_date: date,
        is_contest: isContest,
        status: publish ? "published" : "draft",
      }),
    }).catch(() => null);
    if (!res?.ok) {
      const j = res ? await res.json().catch(() => ({})) : {};
      setError((j as { error?: string }).error ?? "Failed to save.");
    } else {
      setTitle(""); setCaption(""); setImageUrl(""); setIsContest(false);
      setGenerated(false); setGenUrl(""); setGenNotes("");
      load();
    }
    setSaving(false);
  }

  async function setStatus(id: string, status: "published" | "draft") {
    setBusy(id);
    await fetch(`/api/admin/cartoons/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    }).catch(() => null);
    setBusy(null);
    load();
  }

  async function remove(id: string) {
    setBusy(id);
    await fetch(`/api/admin/cartoons/${id}`, { method: "DELETE" }).catch(() => null);
    setBusy(null);
    load();
  }

  async function openPicker(id: string) {
    setPickingFor(id);
    setEntries([]);
    const res = await fetch(`/api/admin/cartoons/${id}`).catch(() => null);
    if (res?.ok) {
      const data = await res.json();
      if (Array.isArray(data)) setEntries(data);
    }
  }

  async function pickWinner(cartoonId: string, captionId: string) {
    setBusy(cartoonId);
    const res = await fetch(`/api/admin/cartoons/${cartoonId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ winner_caption_id: captionId }),
    }).catch(() => null);
    if (!res?.ok) {
      const j = res ? await res.json().catch(() => ({})) : {};
      setError((j as { error?: string }).error ?? "Failed to pick winner.");
    } else {
      setPickingFor(null);
    }
    setBusy(null);
    load();
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
          <PenTool className="w-4 h-4 text-brand-500" /> Daily Cartoon
        </h2>
        <p className="text-xs text-gray-400 mt-0.5">
          One per day (same date overwrites). Contest cartoons publish without a caption —
          picking a winner sets it and awards them 25 points.
        </p>
      </div>

      {/* Create */}
      <div className="card p-5 space-y-3">
        <div className="bg-gray-50 rounded-xl p-3 space-y-2">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Generate from headlines</p>
          <input
            type="url"
            value={genUrl}
            onChange={(e) => setGenUrl(e.target.value)}
            placeholder="Paste a specific article link (optional) — otherwise picks from today's local headlines"
            className={INPUT}
          />
          <input
            type="text"
            value={genNotes}
            onChange={(e) => setGenNotes(e.target.value)}
            placeholder="Notes for the take (optional) — e.g. 'focus on the metro delay' or 'make it more upbeat'…"
            className={INPUT}
          />
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <button
              type="button"
              onClick={() => generateFromHeadlines()}
              disabled={generating}
              className="flex items-center gap-1.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-bold px-4 py-2 rounded-xl transition-colors disabled:opacity-60"
            >
              {generating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : generated ? (
                <RefreshCw className="w-4 h-4" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              {generating ? "Writing & drawing…" : generated ? "Regenerate" : "Generate"}
            </button>
            <p className="text-xs text-gray-400">Writes it, illustrates it — review before publishing.</p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={100}
            placeholder="Title * — e.g. The Site Visit" className={INPUT} />
          <input type="text" value={artist} onChange={(e) => setArtist(e.target.value)} maxLength={60}
            placeholder="Artist credit (default: NeopolisNews)" className={INPUT} />
        </div>
        <div className="grid sm:grid-cols-2 gap-3 items-center">
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={INPUT} />
          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input type="checkbox" checked={isContest} onChange={(e) => setIsContest(e.target.checked)}
              className="accent-brand-600" />
            <Trophy className="w-4 h-4 text-amber-500" /> Caption contest (no caption; readers submit)
          </label>
        </div>
        {!isContest && (
          <input type="text" value={caption} onChange={(e) => setCaption(e.target.value)} maxLength={200}
            placeholder="Caption — the punchline under the panel" className={INPUT} />
        )}

        {imageUrl ? (
          <div className="relative inline-block">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imageUrl} alt="Cartoon" className="h-40 rounded-xl object-contain bg-gray-50 border border-gray-100" />
            <button type="button" onClick={() => setImageUrl("")}
              className="absolute -top-2 -right-2 bg-gray-900 text-white rounded-full p-1 hover:bg-red-600 transition-colors">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
            className="flex items-center gap-2 border border-dashed border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-500 hover:border-brand-400 hover:text-brand-600 transition-colors disabled:opacity-60">
            {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImagePlus className="w-4 h-4" />}
            {uploading ? "Uploading…" : "Upload cartoon image *"}
          </button>
        )}
        <input ref={fileRef} type="file" accept="image/*" onChange={handleUpload} className="hidden" />

        {error && (
          <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">{error}</p>
        )}

        <div className="flex gap-2">
          <button onClick={() => save(true)} disabled={saving || uploading || !title.trim() || !imageUrl}
            className="flex items-center gap-1.5 btn-primary text-sm disabled:opacity-60">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            Publish
          </button>
          <button onClick={() => save(false)} disabled={saving || uploading || !title.trim() || !imageUrl}
            className="btn-secondary text-sm disabled:opacity-60">
            Save as Draft
          </button>
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-gray-300" />
        </div>
      ) : (
        <div className="space-y-3">
          {cartoons.map((c) => (
            <div key={c.id} className="card p-4">
              <div className="flex items-center gap-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={c.image_url} alt={c.title} className="w-20 h-16 rounded-lg object-cover object-top bg-gray-50 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-bold text-sm text-gray-900 truncate">{c.title}</p>
                    <span className={clsx("text-[10px] font-bold px-2 py-0.5 rounded-full",
                      c.status === "published" ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500")}>
                      {c.status.toUpperCase()}
                    </span>
                    {c.is_contest && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 inline-flex items-center gap-1">
                        <Trophy className="w-2.5 h-2.5" />
                        {c.winner_name ? `WON: @${c.winner_name}` : "CONTEST OPEN"}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {new Date(c.publish_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    {" · "}✏️ {c.artist_name}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  {c.is_contest && !c.winner_name && c.status === "published" && (
                    <button onClick={() => openPicker(c.id)} title="Pick winner"
                      className="p-2 rounded-lg text-amber-500 hover:bg-amber-50 transition-colors">
                      <Trophy className="w-4 h-4" />
                    </button>
                  )}
                  <button onClick={() => setStatus(c.id, c.status === "published" ? "draft" : "published")}
                    disabled={busy === c.id} title={c.status === "published" ? "Unpublish" : "Publish"}
                    className="p-2 rounded-lg text-gray-400 hover:bg-gray-50 transition-colors">
                    {c.status === "published" ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <button onClick={() => remove(c.id)} disabled={busy === c.id} title="Delete"
                    className="p-2 rounded-lg text-gray-300 hover:bg-red-50 hover:text-red-500 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Winner picker */}
              {pickingFor === c.id && (
                <div className="mt-3 pt-3 border-t border-gray-50 space-y-2">
                  <p className="text-xs font-bold text-gray-600">
                    Pick the winning caption (awards 25 points):
                  </p>
                  {entries.length === 0 ? (
                    <p className="text-xs text-gray-400">No entries yet.</p>
                  ) : (
                    entries.map((e) => (
                      <div key={e.id} className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
                        <p className="flex-1 text-sm text-gray-700 min-w-0">
                          <span className="font-semibold">@{e.author_name}:</span> &ldquo;{e.body}&rdquo;
                        </p>
                        <button onClick={() => pickWinner(c.id, e.id)} disabled={busy === c.id}
                          className="shrink-0 flex items-center gap-1 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors disabled:opacity-60">
                          <CheckCircle2 className="w-3 h-3" /> Winner
                        </button>
                      </div>
                    ))
                  )}
                  <button onClick={() => setPickingFor(null)} className="text-xs font-semibold text-gray-500">
                    Close
                  </button>
                </div>
              )}
            </div>
          ))}
          {cartoons.length === 0 && (
            <div className="card p-10 text-center text-sm text-gray-400">
              No cartoons yet — upload the first one above.{" "}
              <Link href="/cartoon" target="_blank" className="text-brand-600 inline-flex items-center gap-1">
                Public page <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
