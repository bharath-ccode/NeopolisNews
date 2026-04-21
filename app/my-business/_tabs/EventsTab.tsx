"use client";

import { useState, useEffect, useRef } from "react";
import { CalendarDays, Plus, Trash2, Loader2, Clock, Upload, X } from "lucide-react";

interface BusinessEvent {
  id: string;
  name: string;
  event_date: string;
  start_time: string;
  end_time: string;
  description: string | null;
  image_url: string | null;
}

const INPUT = "w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 text-gray-800";
const LABEL = "block text-xs font-semibold text-gray-500 mb-1.5";

export default function EventsTab({ businessId, token }: { businessId: string; token: string }) {
  const [events, setEvents] = useState<BusinessEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const imageRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/my-business/events?businessId=${businessId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => { setEvents(Array.isArray(data) ? data : []); setLoading(false); });
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
    setName(""); setEventDate(""); setStartTime(""); setEndTime(""); setDescription(""); setImageUrl(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !eventDate || !startTime || !endTime) return;
    setSaving(true);
    const res = await fetch("/api/my-business/events", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ businessId, name, event_date: eventDate, start_time: startTime, end_time: endTime, description: description || null, image_url: imageUrl }),
    });
    if (res.ok) {
      const newEvent = await res.json();
      setEvents((prev) => [...prev, newEvent].sort((a, b) => a.event_date.localeCompare(b.event_date)));
      resetForm();
      setShowForm(false);
    }
    setSaving(false);
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    await fetch(`/api/my-business/events/${id}?businessId=${businessId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    setEvents((prev) => prev.filter((e) => e.id !== id));
    setDeletingId(null);
  }

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-brand-500" /></div>;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-gray-900">Events</h3>
          <p className="text-xs text-gray-400 mt-0.5">{events.length} event{events.length !== 1 ? "s" : ""} listed</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary text-sm py-2">
          <Plus className="w-4 h-4" /> Add Event
        </button>
      </div>

      {showForm && (
        <div className="card p-5 space-y-4">
          <h4 className="font-semibold text-gray-900 text-sm">New Event</h4>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className={LABEL}>Event Name *</label>
              <input className={INPUT} value={name} onChange={(e) => setName(e.target.value)} placeholder="Summer Sale Launch Party" required />
            </div>
            <div>
              <label className={LABEL}>Date *</label>
              <input type="date" className={INPUT} value={eventDate} onChange={(e) => setEventDate(e.target.value)} required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={LABEL}>Start Time *</label>
                <input type="time" className={INPUT} value={startTime} onChange={(e) => setStartTime(e.target.value)} required />
              </div>
              <div>
                <label className={LABEL}>End Time *</label>
                <input type="time" className={INPUT} value={endTime} onChange={(e) => setEndTime(e.target.value)} required />
              </div>
            </div>
            <div>
              <label className={LABEL}>Description</label>
              <textarea className={INPUT + " resize-none"} rows={3} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Tell people what to expect…" maxLength={300} />
            </div>
            <div>
              <label className={LABEL}>Event Photo</label>
              {imageUrl ? (
                <div className="relative w-full h-32 rounded-xl overflow-hidden border border-gray-200">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={imageUrl} alt="Event" className="w-full h-full object-cover" />
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
                {saving ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Save Event"}
              </button>
            </div>
          </form>
        </div>
      )}

      {events.length === 0 && !showForm ? (
        <div className="card p-10 text-center border-dashed">
          <CalendarDays className="w-8 h-8 text-gray-200 mx-auto mb-2" />
          <p className="text-sm text-gray-500">No events yet. Add your first event to let customers know what&apos;s coming.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {events.map((ev) => (
            <div key={ev.id} className="card p-4 flex gap-4">
              {ev.image_url && (
                <div className="w-20 h-16 rounded-xl overflow-hidden shrink-0 border border-gray-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={ev.image_url} alt={ev.name} className="w-full h-full object-cover" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm text-gray-900 truncate">{ev.name}</p>
                <p className="text-xs text-brand-600 font-semibold mt-0.5">
                  {new Date(ev.event_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                </p>
                <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                  <Clock className="w-3 h-3" />
                  {ev.start_time.slice(0, 5)} – {ev.end_time.slice(0, 5)}
                </p>
                {ev.description && <p className="text-xs text-gray-500 mt-1 line-clamp-2">{ev.description}</p>}
              </div>
              <button onClick={() => handleDelete(ev.id)} disabled={deletingId === ev.id}
                className="p-2 rounded-lg text-gray-300 hover:bg-red-50 hover:text-red-500 transition-colors shrink-0 self-start">
                {deletingId === ev.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
