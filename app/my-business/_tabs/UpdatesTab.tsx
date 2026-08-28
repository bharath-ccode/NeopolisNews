"use client";

import { useState, useEffect, useRef } from "react";
import {
  Bell, Plus, Trash2, Loader2, Upload, X,
  Rocket, Sparkles, UserPlus, AlertCircle, Heart, ExternalLink,
} from "lucide-react";

interface BusinessUpdate {
  id: string;
  type: string;
  title: string;
  body: string;
  image_url: string | null;
  cta_label: string | null;
  cta_url: string | null;
  created_at: string;
}

const UPDATE_TYPES = [
  { value: "opening",     label: "Grand Opening",  icon: Rocket,       color: "bg-green-50 text-green-700 border-green-200"   },
  { value: "new_arrival", label: "New Arrival",    icon: Sparkles,     color: "bg-blue-50 text-blue-700 border-blue-200"      },
  { value: "hiring",      label: "We're Hiring",   icon: UserPlus,     color: "bg-purple-50 text-purple-700 border-purple-200" },
  { value: "notice",      label: "Notice",         icon: AlertCircle,  color: "bg-amber-50 text-amber-700 border-amber-200"   },
  { value: "community",   label: "Community",      icon: Heart,        color: "bg-pink-50 text-pink-700 border-pink-200"      },
] as const;

const INPUT = "w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 text-gray-800";
const LABEL = "block text-xs font-semibold text-gray-500 mb-1.5";

function TypeBadge({ type }: { type: string }) {
  const t = UPDATE_TYPES.find((u) => u.value === type) ?? UPDATE_TYPES[3];
  const Icon = t.icon;
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full border ${t.color}`}>
      <Icon className="w-3 h-3" /> {t.label}
    </span>
  );
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

export default function UpdatesTab({ businessId, token }: { businessId: string; token: string }) {
  const [updates, setUpdates] = useState<BusinessUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const imageRef = useRef<HTMLInputElement>(null);

  const [type, setType] = useState("opening");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [ctaLabel, setCtaLabel] = useState("");
  const [ctaUrl, setCtaUrl] = useState("");

  useEffect(() => {
    fetch(`/api/my-business/updates?businessId=${businessId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => { setUpdates(Array.isArray(data) ? data : []); setLoading(false); });
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
    setType("opening"); setTitle(""); setBody(""); setImageUrl(null);
    setCtaLabel(""); setCtaUrl("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;
    setSaving(true);
    const res = await fetch("/api/my-business/updates", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        businessId, type, title: title.trim(), body: body.trim(),
        image_url: imageUrl,
        cta_label: ctaLabel.trim() || null,
        cta_url: ctaUrl.trim() || null,
      }),
    });
    if (res.ok) {
      const newUpdate = await res.json();
      setUpdates((prev) => [newUpdate, ...prev]);
      resetForm();
      setShowForm(false);
    }
    setSaving(false);
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    await fetch(`/api/my-business/updates/${id}?businessId=${businessId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    setUpdates((prev) => prev.filter((u) => u.id !== id));
    setDeletingId(null);
  }

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-brand-500" /></div>;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-gray-900">Announcements</h3>
          <p className="text-xs text-gray-400 mt-0.5">{updates.length} post{updates.length !== 1 ? "s" : ""} — visible for 60 days</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary text-sm py-2">
          <Plus className="w-4 h-4" /> New Post
        </button>
      </div>

      {showForm && (
        <div className="card p-5 space-y-4">
          <h4 className="font-semibold text-gray-900 text-sm">New Announcement</h4>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Type selector */}
            <div>
              <label className={LABEL}>Type *</label>
              <div className="flex flex-wrap gap-2">
                {UPDATE_TYPES.map((t) => {
                  const Icon = t.icon;
                  return (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => setType(t.value)}
                      className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors ${
                        type === t.value ? t.color : "bg-gray-50 text-gray-500 border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" /> {t.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className={LABEL}>Headline *</label>
              <input
                className={INPUT}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={
                  type === "opening"     ? "We're now open in Neopolis!" :
                  type === "new_arrival" ? "New items just arrived" :
                  type === "hiring"      ? "We're looking for a barista" :
                  type === "community"   ? "We're sponsoring the school fair" :
                  "Important update for our customers"
                }
                maxLength={100}
                required
              />
            </div>

            <div>
              <label className={LABEL}>Details *</label>
              <textarea
                className={INPUT + " resize-none"}
                rows={3}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Tell the neighbourhood more…"
                maxLength={500}
                required
              />
              <p className="text-xs text-gray-400 mt-1 text-right">{body.length}/500</p>
            </div>

            {/* Image */}
            <div>
              <label className={LABEL}>Image <span className="font-normal text-gray-400">(optional)</span></label>
              {imageUrl ? (
                <div className="relative w-full h-32 rounded-xl overflow-hidden border border-gray-200">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={imageUrl} alt="Update" className="w-full h-full object-cover" />
                  <button type="button" onClick={() => setImageUrl(null)}
                    className="absolute top-2 right-2 w-7 h-7 bg-black/60 hover:bg-black/80 text-white rounded-full flex items-center justify-center">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button type="button" onClick={() => imageRef.current?.click()} disabled={uploading}
                  className="w-full h-20 rounded-xl border-2 border-dashed border-gray-200 hover:border-brand-300 flex items-center justify-center gap-2 text-gray-400 hover:text-brand-600 transition-colors text-sm">
                  {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
                  {uploading ? "Uploading…" : "Add image"}
                </button>
              )}
              <input ref={imageRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
            </div>

            {/* Optional CTA */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={LABEL}>Button label <span className="font-normal text-gray-400">(optional)</span></label>
                <input className={INPUT} value={ctaLabel} onChange={(e) => setCtaLabel(e.target.value)} placeholder="Apply Now" maxLength={30} />
              </div>
              <div>
                <label className={LABEL}>Button URL <span className="font-normal text-gray-400">(optional)</span></label>
                <input type="url" className={INPUT} value={ctaUrl} onChange={(e) => setCtaUrl(e.target.value)} placeholder="https://…" />
              </div>
            </div>

            <div className="flex gap-3 pt-1">
              <button type="button" onClick={() => { resetForm(); setShowForm(false); }} className="btn-secondary text-sm flex-1">Cancel</button>
              <button type="submit" disabled={saving} className="btn-primary text-sm flex-1">
                {saving ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Post Announcement"}
              </button>
            </div>
          </form>
        </div>
      )}

      {updates.length === 0 && !showForm ? (
        <div className="card p-10 text-center border-dashed">
          <Bell className="w-8 h-8 text-gray-200 mx-auto mb-2" />
          <p className="text-sm text-gray-500">No announcements yet.</p>
          <p className="text-xs text-gray-400 mt-1">Tell your neighbourhood you&apos;ve arrived, you&apos;re hiring, or share community news.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {updates.map((u) => (
            <div key={u.id} className="card p-4 flex gap-4">
              {u.image_url && (
                <div className="w-20 h-16 rounded-xl overflow-hidden shrink-0 border border-gray-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={u.image_url} alt={u.title} className="w-full h-full object-cover" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <TypeBadge type={u.type} />
                  <span className="text-xs text-gray-400">{timeAgo(u.created_at)}</span>
                </div>
                <p className="font-bold text-sm text-gray-900">{u.title}</p>
                <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{u.body}</p>
                {u.cta_label && u.cta_url && (
                  <a href={u.cta_url} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700 mt-1.5">
                    <ExternalLink className="w-3 h-3" /> {u.cta_label}
                  </a>
                )}
              </div>
              <button onClick={() => handleDelete(u.id)} disabled={deletingId === u.id}
                className="p-2 rounded-lg text-gray-300 hover:bg-red-50 hover:text-red-500 transition-colors shrink-0 self-start">
                {deletingId === u.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
