"use client";

import { useState, useEffect } from "react";
import { Stethoscope, Plus, Trash2, Pencil, Loader2 } from "lucide-react";

interface Practitioner {
  id: string;
  name: string;
  title: string | null;
  qualifications: string | null;
  registration_number: string | null;
  years_experience: number | null;
  consultation_fee: number | null;
  bio: string | null;
}

const INPUT = "w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 text-gray-800";
const LABEL = "block text-xs font-semibold text-gray-500 mb-1.5";

const emptyForm = {
  name: "", title: "", qualifications: "", registration_number: "",
  years_experience: "", consultation_fee: "", bio: "",
};

export default function PractitionersTab({ businessId, token }: { businessId: string; token: string }) {
  const [practitioners, setPractitioners] = useState<Practitioner[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    fetch(`/api/my-business/practitioners?businessId=${businessId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => { setPractitioners(Array.isArray(data) ? data : []); setLoading(false); });
  }, [businessId, token]);

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
  }

  function startEdit(p: Practitioner) {
    setForm({
      name: p.name,
      title: p.title ?? "",
      qualifications: p.qualifications ?? "",
      registration_number: p.registration_number ?? "",
      years_experience: p.years_experience?.toString() ?? "",
      consultation_fee: p.consultation_fee?.toString() ?? "",
      bio: p.bio ?? "",
    });
    setEditingId(p.id);
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSaving(true);
    const payload = {
      businessId,
      name: form.name.trim(),
      title: form.title || null,
      qualifications: form.qualifications || null,
      registration_number: form.registration_number || null,
      years_experience: form.years_experience || null,
      consultation_fee: form.consultation_fee || null,
      bio: form.bio || null,
    };
    const res = editingId
      ? await fetch(`/api/my-business/practitioners/${editingId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify(payload),
        })
      : await fetch("/api/my-business/practitioners", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify(payload),
        });
    if (res.ok) {
      const saved = await res.json();
      setPractitioners((prev) =>
        editingId ? prev.map((p) => (p.id === editingId ? saved : p)) : [...prev, saved]
      );
      resetForm();
      setShowForm(false);
    }
    setSaving(false);
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    await fetch(`/api/my-business/practitioners/${id}?businessId=${businessId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    setPractitioners((prev) => prev.filter((p) => p.id !== id));
    setDeletingId(null);
  }

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-brand-500" /></div>;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-gray-900">Practitioners</h3>
          <p className="text-xs text-gray-400 mt-0.5">
            {practitioners.length} listed · shown on your public profile, and as a picker on the
            appointment form once you have more than one.
          </p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(!showForm); }}
          className="btn-primary text-sm py-2"
        >
          <Plus className="w-4 h-4" /> Add Practitioner
        </button>
      </div>

      {showForm && (
        <div className="card p-5 space-y-4">
          <h4 className="font-semibold text-gray-900 text-sm">{editingId ? "Edit Practitioner" : "New Practitioner"}</h4>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className={LABEL}>Name *</label>
              <input className={INPUT} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Dr. Priya Sharma" required />
            </div>
            <div>
              <label className={LABEL}>Title / Specialization</label>
              <input className={INPUT} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Consultant Cardiologist" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={LABEL}>Qualifications</label>
                <input className={INPUT} value={form.qualifications} onChange={(e) => setForm({ ...form, qualifications: e.target.value })} placeholder="MBBS, MD" />
              </div>
              <div>
                <label className={LABEL}>Registration No.</label>
                <input className={INPUT} value={form.registration_number} onChange={(e) => setForm({ ...form, registration_number: e.target.value })} placeholder="TSMC 12345" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={LABEL}>Years of Experience</label>
                <input type="number" min="0" className={INPUT} value={form.years_experience} onChange={(e) => setForm({ ...form, years_experience: e.target.value })} placeholder="12" />
              </div>
              <div>
                <label className={LABEL}>Consultation Fee (₹)</label>
                <input type="number" min="0" className={INPUT} value={form.consultation_fee} onChange={(e) => setForm({ ...form, consultation_fee: e.target.value })} placeholder="500" />
              </div>
            </div>
            <div>
              <label className={LABEL}>Bio <span className="font-normal text-gray-400">(optional)</span></label>
              <textarea className={INPUT + " resize-none"} rows={2} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} placeholder="A line or two for patients — areas of focus, approach, etc." maxLength={300} />
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

      {practitioners.length === 0 && !showForm ? (
        <div className="card p-10 text-center border-dashed">
          <Stethoscope className="w-8 h-8 text-gray-200 mx-auto mb-2" />
          <p className="text-sm text-gray-500">No practitioners added yet. Add each doctor who sees patients here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {practitioners.map((p) => (
            <div key={p.id} className="card p-4 flex gap-3">
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm text-gray-900">{p.name}</p>
                {p.title && <p className="text-xs text-brand-600 font-semibold mt-0.5">{p.title}</p>}
                <p className="text-xs text-gray-400 mt-0.5">
                  {[p.qualifications, p.years_experience ? `${p.years_experience} yrs experience` : null, p.consultation_fee ? `₹${p.consultation_fee} consultation` : null]
                    .filter(Boolean).join(" · ")}
                </p>
                {p.registration_number && <p className="text-[11px] text-gray-300 mt-0.5">Reg. {p.registration_number}</p>}
                {p.bio && <p className="text-xs text-gray-500 mt-1.5 line-clamp-2">{p.bio}</p>}
              </div>
              <div className="flex flex-col gap-1 shrink-0">
                <button onClick={() => startEdit(p)} className="p-2 rounded-lg text-gray-300 hover:bg-gray-50 hover:text-gray-600 transition-colors">
                  <Pencil className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(p.id)} disabled={deletingId === p.id} className="p-2 rounded-lg text-gray-300 hover:bg-red-50 hover:text-red-500 transition-colors">
                  {deletingId === p.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
