"use client";

import { useState, useEffect, useRef } from "react";
import { Tag, Plus, Trash2, Loader2, Upload, X } from "lucide-react";

interface BusinessOffer {
  id: string;
  name: string;
  description: string | null;
  discount_percent: number | null;
  discount_label: string | null;
  start_date: string;
  end_date: string;
  image_url: string | null;
}

const INPUT = "w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 text-gray-800";
const LABEL = "block text-xs font-semibold text-gray-500 mb-1.5";

export default function OffersTab({ businessId, token }: { businessId: string; token: string }) {
  const [offers, setOffers] = useState<BusinessOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const imageRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [discountPercent, setDiscountPercent] = useState("");
  const [discountLabel, setDiscountLabel] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/my-business/offers?businessId=${businessId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => { setOffers(Array.isArray(data) ? data : []); setLoading(false); });
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
    setName(""); setDescription(""); setDiscountPercent(""); setDiscountLabel(""); setStartDate(""); setEndDate(""); setImageUrl(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !startDate || !endDate) return;
    setSaving(true);
    const res = await fetch("/api/my-business/offers", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        businessId, name,
        description: description || null,
        discount_percent: discountPercent ? Number(discountPercent) : null,
        discount_label: discountLabel || null,
        start_date: startDate,
        end_date: endDate,
        image_url: imageUrl,
      }),
    });
    if (res.ok) {
      const newOffer = await res.json();
      setOffers((prev) => [...prev, newOffer].sort((a, b) => a.start_date.localeCompare(b.start_date)));
      resetForm();
      setShowForm(false);
    }
    setSaving(false);
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    await fetch(`/api/my-business/offers/${id}?businessId=${businessId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    setOffers((prev) => prev.filter((o) => o.id !== id));
    setDeletingId(null);
  }

  function discountDisplay(offer: BusinessOffer): string {
    if (offer.discount_percent) return `${offer.discount_percent}% off`;
    if (offer.discount_label) return offer.discount_label;
    return "Special offer";
  }

  function isActive(offer: BusinessOffer): boolean {
    const today = new Date().toISOString().split("T")[0];
    return offer.start_date <= today && offer.end_date >= today;
  }

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-brand-500" /></div>;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-gray-900">Offers</h3>
          <p className="text-xs text-gray-400 mt-0.5">{offers.length} offer{offers.length !== 1 ? "s" : ""} listed</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary text-sm py-2">
          <Plus className="w-4 h-4" /> Add Offer
        </button>
      </div>

      {showForm && (
        <div className="card p-5 space-y-4">
          <h4 className="font-semibold text-gray-900 text-sm">New Offer</h4>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className={LABEL}>Offer Name *</label>
              <input className={INPUT} value={name} onChange={(e) => setName(e.target.value)} placeholder="Diwali Special Discount" required />
            </div>
            <div>
              <label className={LABEL}>Description</label>
              <textarea className={INPUT + " resize-none"} rows={2} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What&apos;s included in this offer…" maxLength={200} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={LABEL}>Discount % <span className="font-normal text-gray-400">(optional)</span></label>
                <input type="number" min="1" max="100" step="0.01" className={INPUT} value={discountPercent} onChange={(e) => setDiscountPercent(e.target.value)} placeholder="20" />
              </div>
              <div>
                <label className={LABEL}>Or Discount Label <span className="font-normal text-gray-400">(optional)</span></label>
                <input className={INPUT} value={discountLabel} onChange={(e) => setDiscountLabel(e.target.value)} placeholder="Buy 1 Get 1 Free" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={LABEL}>Start Date *</label>
                <input type="date" className={INPUT} value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
              </div>
              <div>
                <label className={LABEL}>End Date *</label>
                <input type="date" className={INPUT} value={endDate} onChange={(e) => setEndDate(e.target.value)} required />
              </div>
            </div>
            <div>
              <label className={LABEL}>Offer Image</label>
              {imageUrl ? (
                <div className="relative w-full h-32 rounded-xl overflow-hidden border border-gray-200">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={imageUrl} alt="Offer" className="w-full h-full object-cover" />
                  <button type="button" onClick={() => setImageUrl(null)}
                    className="absolute top-2 right-2 w-7 h-7 bg-black/60 hover:bg-black/80 text-white rounded-full flex items-center justify-center">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button type="button" onClick={() => imageRef.current?.click()} disabled={uploading}
                  className="w-full h-24 rounded-xl border-2 border-dashed border-gray-200 hover:border-brand-300 flex flex-col items-center justify-center gap-1 text-gray-400 hover:text-brand-600 transition-colors text-sm">
                  {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
                  {uploading ? "Uploading…" : "Upload image"}
                </button>
              )}
              <input ref={imageRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
            </div>
            <div className="flex gap-3 pt-1">
              <button type="button" onClick={() => { resetForm(); setShowForm(false); }} className="btn-secondary text-sm flex-1">Cancel</button>
              <button type="submit" disabled={saving} className="btn-primary text-sm flex-1">
                {saving ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Save Offer"}
              </button>
            </div>
          </form>
        </div>
      )}

      {offers.length === 0 && !showForm ? (
        <div className="card p-10 text-center border-dashed">
          <Tag className="w-8 h-8 text-gray-200 mx-auto mb-2" />
          <p className="text-sm text-gray-500">No offers yet. Add a discount or deal to attract customers.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {offers.map((offer) => (
            <div key={offer.id} className="card p-4 flex gap-4">
              {offer.image_url && (
                <div className="w-20 h-16 rounded-xl overflow-hidden shrink-0 border border-gray-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={offer.image_url} alt={offer.name} className="w-full h-full object-cover" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-bold text-sm text-gray-900 truncate">{offer.name}</p>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${isActive(offer) ? "bg-green-50 text-green-700 border border-green-200" : "bg-gray-100 text-gray-400 border border-gray-200"}`}>
                    {isActive(offer) ? "Active" : "Inactive"}
                  </span>
                </div>
                <p className="text-xs text-brand-600 font-semibold mt-0.5">{discountDisplay(offer)}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {new Date(offer.start_date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })} –{" "}
                  {new Date(offer.end_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                </p>
                {offer.description && <p className="text-xs text-gray-500 mt-1 line-clamp-2">{offer.description}</p>}
              </div>
              <button onClick={() => handleDelete(offer.id)} disabled={deletingId === offer.id}
                className="p-2 rounded-lg text-gray-300 hover:bg-red-50 hover:text-red-500 transition-colors shrink-0 self-start">
                {deletingId === offer.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
