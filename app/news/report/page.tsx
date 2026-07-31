"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft, Megaphone, Send, Loader2, ImagePlus, X, Clock,
  AtSign, LogIn, CheckCircle2, XCircle, Hourglass, ExternalLink,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { authHeaders } from "@/lib/authToken";

interface MyReport {
  id: string;
  title: string;
  body: string;
  area: string | null;
  image_url: string | null;
  status: "pending" | "approved" | "rejected";
  admin_note: string | null;
  article_id: string | null;
  created_at: string;
}

const STATUS_META = {
  pending:  { label: "Awaiting review", icon: Hourglass,    cls: "bg-amber-50 text-amber-700 border-amber-200" },
  approved: { label: "Published",       icon: CheckCircle2, cls: "bg-green-50 text-green-700 border-green-200" },
  rejected: { label: "Not published",   icon: XCircle,      cls: "bg-red-50 text-red-600 border-red-200" },
} as const;

export default function ReportNewsPage() {
  const { user, loading: authLoading } = useAuth();

  const [title, setTitle] = useState("");
  const [area, setArea]   = useState("");
  const [body, setBody]   = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [sending, setSending]     = useState(false);
  const [error, setError]         = useState("");
  const [submitted, setSubmitted] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const [myReports, setMyReports] = useState<MyReport[]>([]);
  const [loadingMine, setLoadingMine] = useState(false);

  const loadMine = useCallback(async () => {
    if (!user) return;
    setLoadingMine(true);
    const res = await fetch("/api/citizen-reports", { headers: await authHeaders() }).catch(() => null);
    if (res?.ok) {
      const data = await res.json();
      if (Array.isArray(data)) setMyReports(data);
    }
    setLoadingMine(false);
  }, [user]);

  useEffect(() => { loadMine(); }, [loadMine]);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", "citizen-reports");
      fd.append("bucket", "news-media");
      const res = await fetch("/api/upload", { method: "POST", body: fd });
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) { setError("Please add a headline."); return; }
    if (!body.trim())  { setError("Please describe what happened."); return; }
    setSending(true);
    setError("");
    const res = await fetch("/api/citizen-reports", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(await authHeaders()) },
      body: JSON.stringify({
        author_name: user!.screen_name,
        title:       title.trim(),
        body:        body.trim(),
        area:        area.trim() || undefined,
        image_url:   imageUrl || undefined,
      }),
    }).catch(() => null);
    if (!res?.ok) {
      const j = res ? await res.json().catch(() => ({})) : {};
      setError((j as { error?: string }).error ?? "Failed to submit report.");
      setSending(false);
      return;
    }
    const newReport = await res.json();
    setMyReports((prev) => [newReport, ...prev]);
    setTitle(""); setArea(""); setBody(""); setImageUrl("");
    setSubmitted(true);
    setSending(false);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white py-10">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <Link
            href="/news"
            className="inline-flex items-center gap-1.5 text-gray-400 hover:text-white text-sm transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> All News
          </Link>
          <div className="flex items-center gap-3 mt-5">
            <div className="w-11 h-11 rounded-xl bg-brand-600 flex items-center justify-center shrink-0">
              <Megaphone className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold">Report Local News</h1>
              <p className="text-gray-400 text-sm mt-0.5">
                Spotted something happening in the neighborhood? Tell everyone.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Auth gates */}
        {authLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-gray-300" />
          </div>
        ) : !user ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
            <LogIn className="w-8 h-8 mx-auto text-brand-200 mb-3" />
            <p className="font-semibold text-gray-700 mb-1">Sign in to report news</p>
            <p className="text-sm text-gray-400 mb-4">
              Your report is reviewed by our team before it's published.
            </p>
            <Link
              href="/auth/login?next=/news/report"
              className="inline-block bg-brand-700 hover:bg-brand-800 text-white font-bold px-6 py-2.5 rounded-xl text-sm transition-colors"
            >
              Sign in
            </Link>
          </div>
        ) : !user.screen_name ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
            <AtSign className="w-8 h-8 mx-auto text-amber-400 mb-3" />
            <p className="font-semibold text-gray-700 mb-1">Choose a screen name first</p>
            <p className="text-sm text-gray-400 mb-4">
              Published reports are credited to your screen name — your real identity stays private.
            </p>
            <Link
              href="/dashboard/individual/profile"
              className="inline-block bg-brand-700 hover:bg-brand-800 text-white font-bold px-6 py-2.5 rounded-xl text-sm transition-colors"
            >
              Set screen name →
            </Link>
          </div>
        ) : (
          <>
            {/* Success banner */}
            {submitted && (
              <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-green-800">Report submitted!</p>
                  <p className="text-xs text-green-700 mt-0.5">
                    Our team will review it shortly. If approved, it's published in the Community
                    section and credited to @{user.screen_name}.
                  </p>
                </div>
                <button onClick={() => setSubmitted(false)} className="text-green-400 hover:text-green-600">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
              <div className="flex items-center gap-2 text-xs text-brand-700 font-semibold">
                <AtSign className="w-3.5 h-3.5" />
                Reporting as @{user.screen_name}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Headline *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={150}
                  placeholder="e.g. New pedestrian crossing installed near the school"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Where? (optional)</label>
                <input
                  type="text"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  maxLength={100}
                  placeholder="e.g. Sector 2, near the main gate"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">What happened? *</label>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  rows={6}
                  maxLength={5000}
                  placeholder="Describe what you saw — when it happened, who's affected, and anything neighbors should know."
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 resize-none"
                />
              </div>

              {/* Photo */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Photo (optional)</label>
                {imageUrl ? (
                  <div className="relative inline-block">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={imageUrl} alt="Report" className="h-32 rounded-xl object-cover" />
                    <button
                      type="button"
                      onClick={() => setImageUrl("")}
                      className="absolute -top-2 -right-2 bg-gray-900 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    disabled={uploading}
                    className="flex items-center gap-2 border border-dashed border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-500 hover:border-brand-400 hover:text-brand-600 transition-colors disabled:opacity-60"
                  >
                    {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImagePlus className="w-4 h-4" />}
                    {uploading ? "Uploading…" : "Add a photo"}
                  </button>
                )}
                <input ref={fileRef} type="file" accept="image/*" onChange={handleUpload} className="hidden" />
              </div>

              {error && (
                <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">{error}</p>
              )}

              <button
                type="submit"
                disabled={sending || uploading}
                className="flex items-center gap-2 bg-brand-700 hover:bg-brand-800 disabled:opacity-60 text-white font-bold px-6 py-2.5 rounded-xl transition-colors text-sm"
              >
                <Send className="w-3.5 h-3.5" /> {sending ? "Submitting…" : "Submit for Review"}
              </button>
              <p className="text-xs text-gray-400">
                Reports are checked by the NeopolisNews team before publishing. Please keep it factual —
                no ads, no personal disputes.
              </p>
            </form>

            {/* My submissions */}
            <div>
              <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 px-1">
                My Reports
              </h2>
              {loadingMine ? (
                <div className="flex justify-center py-6">
                  <Loader2 className="w-5 h-5 animate-spin text-gray-300" />
                </div>
              ) : myReports.length === 0 ? (
                <p className="text-sm text-gray-400 px-1">Nothing submitted yet.</p>
              ) : (
                <div className="space-y-3">
                  {myReports.map((r) => {
                    const meta = STATUS_META[r.status];
                    return (
                      <div key={r.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                        <div className="flex flex-wrap items-center gap-2 mb-1.5">
                          <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border ${meta.cls}`}>
                            <meta.icon className="w-3 h-3" /> {meta.label}
                          </span>
                          <span className="flex items-center gap-1 text-xs text-gray-400 ml-auto">
                            <Clock className="w-3 h-3" />
                            {new Date(r.created_at).toLocaleDateString("en-IN", {
                              day: "numeric", month: "short", year: "numeric",
                            })}
                          </span>
                        </div>
                        <p className="font-semibold text-sm text-gray-900">{r.title}</p>
                        {r.area && <p className="text-xs text-gray-400 mt-0.5">{r.area}</p>}
                        <p className="text-sm text-gray-500 mt-1.5 line-clamp-2">{r.body}</p>
                        {r.status === "approved" && r.article_id && (
                          <Link
                            href={`/news/${r.article_id}`}
                            className="inline-flex items-center gap-1 text-brand-600 hover:text-brand-800 text-xs font-semibold mt-2"
                          >
                            <ExternalLink className="w-3 h-3" /> View published article
                          </Link>
                        )}
                        {r.status === "rejected" && r.admin_note && (
                          <p className="text-xs text-red-500 bg-red-50 rounded-lg px-3 py-2 mt-2">
                            Reviewer note: {r.admin_note}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
