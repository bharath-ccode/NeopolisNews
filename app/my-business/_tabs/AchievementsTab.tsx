"use client";

import { useState, useEffect, useRef } from "react";
import { Trophy, Plus, Trash2, Pencil, Loader2, Upload, X } from "lucide-react";

interface Achievement {
  id: string;
  student_name: string | null;
  class_grade: string | null;
  title: string;
  category: string | null;
  achieved_date: string | null;
  image_url: string | null;
}

const INPUT = "w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 text-gray-800";
const LABEL = "block text-xs font-semibold text-gray-500 mb-1.5";

const CATEGORIES = ["Academic", "Sports", "Arts", "Co-curricular", "Other"];

const emptyForm = {
  student_name: "", class_grade: "", title: "", category: "", achieved_date: "", image_url: null as string | null,
};

export default function AchievementsTab({ businessId, token }: { businessId: string; token: string }) {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const imageRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch(`/api/my-business/achievements?businessId=${businessId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => { setAchievements(Array.isArray(data) ? data : []); setLoading(false); });
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
    if (url) setForm((f) => ({ ...f, image_url: url }));
    setUploading(false);
    if (imageRef.current) imageRef.current.value = "";
  }

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
  }

  function startEdit(a: Achievement) {
    setForm({
      student_name: a.student_name ?? "",
      class_grade: a.class_grade ?? "",
      title: a.title,
      category: a.category ?? "",
      achieved_date: a.achieved_date ?? "",
      image_url: a.image_url,
    });
    setEditingId(a.id);
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) return;
    setSaving(true);
    const payload = {
      businessId,
      student_name: form.student_name || null,
      class_grade: form.class_grade || null,
      title: form.title.trim(),
      category: form.category || null,
      achieved_date: form.achieved_date || null,
      image_url: form.image_url,
    };
    const res = editingId
      ? await fetch(`/api/my-business/achievements/${editingId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify(payload),
        })
      : await fetch("/api/my-business/achievements", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify(payload),
        });
    if (res.ok) {
      const saved = await res.json();
      setAchievements((prev) =>
        editingId ? prev.map((a) => (a.id === editingId ? saved : a)) : [saved, ...prev]
      );
      resetForm();
      setShowForm(false);
    }
    setSaving(false);
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    await fetch(`/api/my-business/achievements/${id}?businessId=${businessId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    setAchievements((prev) => prev.filter((a) => a.id !== id));
    setDeletingId(null);
  }

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-brand-500" /></div>;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-gray-900">Achievements</h3>
          <p className="text-xs text-gray-400 mt-0.5">
            {achievements.length} listed · shown on your public profile. For a bigger story (annual
            day, a major award), use the News tab instead — this is for the everyday wins.
          </p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(!showForm); }}
          className="btn-primary text-sm py-2"
        >
          <Plus className="w-4 h-4" /> Add Achievement
        </button>
      </div>

      {showForm && (
        <div className="card p-5 space-y-4">
          <h4 className="font-semibold text-gray-900 text-sm">{editingId ? "Edit Achievement" : "New Achievement"}</h4>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className={LABEL}>Achievement *</label>
              <input className={INPUT} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="State-level Chess Champion" required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={LABEL}>Student Name <span className="font-normal text-gray-400">(optional)</span></label>
                <input className={INPUT} value={form.student_name} onChange={(e) => setForm({ ...form, student_name: e.target.value })} placeholder="Leave blank if school-wide" />
              </div>
              <div>
                <label className={LABEL}>Class / Grade</label>
                <input className={INPUT} value={form.class_grade} onChange={(e) => setForm({ ...form, class_grade: e.target.value })} placeholder="Grade 8" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={LABEL}>Category</label>
                <select className={INPUT} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                  <option value="">Select…</option>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className={LABEL}>Date</label>
                <input type="date" className={INPUT} value={form.achieved_date} onChange={(e) => setForm({ ...form, achieved_date: e.target.value })} />
              </div>
            </div>
            <div>
              <label className={LABEL}>Photo <span className="font-normal text-gray-400">(optional)</span></label>
              {form.image_url ? (
                <div className="relative w-full h-32 rounded-xl overflow-hidden border border-gray-200">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={form.image_url} alt={form.title} className="w-full h-full object-cover" />
                  <button type="button" onClick={() => setForm({ ...form, image_url: null })}
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
                {saving ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Save"}
              </button>
            </div>
          </form>
        </div>
      )}

      {achievements.length === 0 && !showForm ? (
        <div className="card p-10 text-center border-dashed">
          <Trophy className="w-8 h-8 text-gray-200 mx-auto mb-2" />
          <p className="text-sm text-gray-500">No achievements added yet. Celebrate a student or school win here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {achievements.map((a) => (
            <div key={a.id} className="card p-4 flex gap-4">
              {a.image_url && (
                <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-gray-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={a.image_url} alt={a.title} className="w-full h-full object-cover" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-bold text-sm text-gray-900">{a.title}</p>
                  {a.category && <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">{a.category}</span>}
                </div>
                <p className="text-xs text-gray-400 mt-0.5">
                  {[a.student_name, a.class_grade].filter(Boolean).join(" · ")}
                  {a.achieved_date && ` · ${new Date(a.achieved_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}`}
                </p>
              </div>
              <div className="flex flex-col gap-1 shrink-0">
                <button onClick={() => startEdit(a)} className="p-2 rounded-lg text-gray-300 hover:bg-gray-50 hover:text-gray-600 transition-colors">
                  <Pencil className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(a.id)} disabled={deletingId === a.id} className="p-2 rounded-lg text-gray-300 hover:bg-red-50 hover:text-red-500 transition-colors">
                  {deletingId === a.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
