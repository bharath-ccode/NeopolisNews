"use client";

import { useState, useEffect, useRef } from "react";
import { Newspaper, Plus, Loader2, Upload, X, Clock, CheckCircle2 } from "lucide-react";

interface NewsSubmission {
  id: string;
  headline: string;
  what_happened: string;
  where_location: string;
  go_live_date: string;
  image_url: string | null;
  submission_status: "pending" | "published" | "rejected";
  article_id: string | null;
  created_at: string;
}

const INPUT = "w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 text-gray-800";
const LABEL = "block text-xs font-semibold text-gray-500 mb-1.5";

function StatusBadge({ status }: { status: NewsSubmission["submission_status"] }) {
  if (status === "published")
    return <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-200 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" />Published</span>;
  if (status === "rejected")
    return <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200">Rejected</span>;
  return <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1"><Clock className="w-3 h-3" />Under review</span>;
}

export default function NewsTab({ businessId, token }: { businessId: string; token: string }) {
  const [submissions, setSubmissions] = useState<NewsSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const imageRef = useRef<HTMLInputElement>(null);

  const [headline, setHeadline] = useState("");
  const [whatHappened, setWhatHappened] = useState("");
  const [whereLocation, setWhereLocation] = useState("");
  const [goLiveDate, setGoLiveDate] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/my-business/news?businessId=${businessId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => { setSubmissions(Array.isArray(data) ? data : []); setLoading(false); });
  }, [businessId, token]);

  async function uploadImage(file: File): Promise<string | null> {
    const form = new FormData();
    form.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: form });
    const data = await res.json();
    return res.ok ? data.url : null;
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const url = await uploadImage(file);
    if (url) setImageUrl(url);
    setUploading(false);
    if (imageRef.current) imageRef.current.value = "";
  }

  function resetForm() {
    setHeadline(""); setWhatHappened(""); setWhereLocation(""); setGoLiveDate(""); setImageUrl(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!headline || !whatHappened || !whereLocation || !goLiveDate) return;
    setSaving(true);
    const res = await fetch("/api/my-business/news", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ businessId, headline, what_happened: whatHappened, where_location: whereLocation, go_live_date: goLiveDate, image_url: imageUrl }),
    });
    if (res.ok) {
      const newSub = await res.json();
      setSubmissions((prev) => [newSub, ...prev]);
      resetForm();
      setShowForm(false);
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 5000);
    }
    setSaving(false);
  }

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-brand-500" /></div>;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-gray-900">News &amp; Updates</h3>
          <p className="text-xs text-gray-400 mt-0.5">{submissions.length} submission{submissions.length !== 1 ? "s" : ""}</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary text-sm py-2">
          <Plus className="w-4 h-4" /> Submit News
        </button>
      </div>

      {submitted && (
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-sm text-green-800">
          <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
          Submitted! Our team will review and publish your update, usually within 24 hours.
        </div>
      )}

      <div className="bg-brand-50 border border-brand-100 rounded-xl px-4 py-3 text-xs text-brand-800">
        <strong>How it works:</strong> Your submission creates a draft article for our editorial team to review. Once approved, it goes live as a news article on NeopolisNews.
      </div>

      {showForm && (
        <div className="card p-5">
          <h4 className="font-semibold text-gray-900 text-sm mb-4">Submit a News Update</h4>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className={LABEL}>Headline *</label>
              <input className={INPUT} value={headline} onChange={(e) => setHeadline(e.target.value)} placeholder="XYZ Cafe wins Best Coffee Award 2026" required maxLength={150} />
            </div>
            <div>
              <label className={LABEL}>What happened? *</label>
              <textarea className={INPUT + " resize-none"} rows={4} value={whatHappened} onChange={(e) => setWhatHappened(e.target.value)}
                placeholder="Describe the achievement, milestone, or update in detail…" required maxLength={1000} />
              <p className="text-xs text-gray-400 mt-1 text-right">{whatHappened.length}/1000</p>
            </div>
            <div>
              <label className={LABEL}>Where did it happen? *</label>
              <input className={INPUT} value={whereLocation} onChange={(e) => setWhereLocation(e.target.value)} placeholder="Neopolis Mall, Hyderabad" required />
            </div>
            <div>
              <label className={LABEL}>Preferred go-live date *</label>
              <input type="date" className={INPUT} value={goLiveDate} onChange={(e) => setGoLiveDate(e.target.value)} required />
              <p className="text-xs text-gray-400 mt-1">Subject to editorial review and approval.</p>
            </div>
            <div>
              <label className={LABEL}>Photo <span className="font-normal text-gray-400">(optional)</span></label>
              {imageUrl ? (
                <div className="relative w-full h-36 rounded-xl overflow-hidden border border-gray-200">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={imageUrl} alt="News" className="w-full h-full object-cover" />
                  <button type="button" onClick={() => setImageUrl(null)}
                    className="absolute top-2 right-2 w-7 h-7 bg-black/60 hover:bg-black/80 text-white rounded-full flex items-center justify-center">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button type="button" onClick={() => imageRef.current?.click()} disabled={uploading}
                  className="w-full h-24 rounded-xl border-2 border-dashed border-gray-200 hover:border-brand-300 flex flex-col items-center justify-center gap-1 text-gray-400 hover:text-brand-600 transition-colors text-sm">
                  {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
                  {uploading ? "Uploading…" : "Upload photo"}
                </button>
              )}
              <input ref={imageRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
            </div>
            <div className="flex gap-3 pt-1">
              <button type="button" onClick={() => { resetForm(); setShowForm(false); }} className="btn-secondary text-sm flex-1">Cancel</button>
              <button type="submit" disabled={saving} className="btn-primary text-sm flex-1">
                {saving ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Submit for Review"}
              </button>
            </div>
          </form>
        </div>
      )}

      {submissions.length === 0 && !showForm ? (
        <div className="card p-10 text-center border-dashed">
          <Newspaper className="w-8 h-8 text-gray-200 mx-auto mb-2" />
          <p className="text-sm text-gray-500">Share an achievement, milestone, or update and it may appear as a news article.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {submissions.map((sub) => (
            <div key={sub.id} className="card p-4 flex gap-4">
              {sub.image_url && (
                <div className="w-20 h-16 rounded-xl overflow-hidden shrink-0 border border-gray-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={sub.image_url} alt={sub.headline} className="w-full h-full object-cover" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-0.5">
                  <p className="font-bold text-sm text-gray-900 truncate">{sub.headline}</p>
                  <StatusBadge status={sub.submission_status} />
                </div>
                <p className="text-xs text-gray-400">
                  Go-live: {new Date(sub.go_live_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  {" · "}Submitted: {new Date(sub.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                </p>
                <p className="text-xs text-gray-500 mt-1 line-clamp-2">{sub.what_happened}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
