"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, Upload, X, CalendarDays } from "lucide-react";

const EVENT_TYPES = [
  { value: "music_concert",  label: "Music Concert"   },
  { value: "sports_run",     label: "Sports & Run"    },
  { value: "food_festival",  label: "Food Festival"   },
  { value: "culture_art",    label: "Culture & Art"   },
  { value: "exhibition",     label: "Exhibition"      },
];

const INPUT = "w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 text-gray-800";
const LABEL = "block text-sm font-semibold text-gray-700 mb-2";

interface Business { id: string; name: string; industry: string; }

export default function AdminCreateEventPage() {
  const router = useRouter();
  const imageRef = useRef<HTMLInputElement>(null);

  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [bizLoading, setBizLoading] = useState(true);
  const [bizSearch, setBizSearch] = useState("");
  const [selectedBiz, setSelectedBiz] = useState<Business | null>(null);
  const [showBizList, setShowBizList] = useState(false);

  const [name, setName] = useState("");
  const [eventType, setEventType] = useState("exhibition");
  const [eventDate, setEventDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isFree, setIsFree] = useState(true);
  const [ticketPrice, setTicketPrice] = useState("");
  const [totalSlots, setTotalSlots] = useState("");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/businesses?limit=100")
      .then((r) => r.json())
      .then((data) => { setBusinesses(Array.isArray(data) ? data : []); setBizLoading(false); });
  }, []);

  const filteredBiz = businesses.filter((b) =>
    b.name.toLowerCase().includes(bizSearch.toLowerCase()) ||
    b.industry.toLowerCase().includes(bizSearch.toLowerCase())
  );

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const form = new FormData();
    form.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: form });
    const data = await res.json();
    if (res.ok) setImageUrl(data.url);
    setUploading(false);
    if (imageRef.current) imageRef.current.value = "";
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedBiz) { setError("Please select a business."); return; }
    setError(""); setSaving(true);
    const res = await fetch("/api/admin/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        businessId: selectedBiz.id,
        name, event_type: eventType, event_date: eventDate,
        end_date: endDate || null,
        start_time: startTime, end_time: endTime,
        description: description || null,
        image_url: imageUrl,
        is_free: isFree,
        ticket_price: !isFree && ticketPrice ? parseFloat(ticketPrice) : null,
        total_slots: totalSlots ? parseInt(totalSlots, 10) : null,
      }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error ?? "Failed to create event."); setSaving(false); return; }
    router.push("/admin/events");
  }

  return (
    <div className="max-w-2xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/admin/events" className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h2 className="text-xl font-bold text-gray-900">New Event</h2>
          <p className="text-sm text-gray-400 mt-0.5">Create an event for any business listing</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="card p-6 space-y-6">

        {/* Business picker */}
        <div>
          <label className={LABEL}>Business *</label>
          <div className="relative">
            <input
              type="text"
              className={INPUT}
              placeholder={bizLoading ? "Loading businesses…" : "Search and select a business…"}
              value={selectedBiz ? selectedBiz.name : bizSearch}
              onChange={(e) => { setBizSearch(e.target.value); setSelectedBiz(null); setShowBizList(true); }}
              onFocus={() => setShowBizList(true)}
              disabled={bizLoading}
              autoComplete="off"
            />
            {selectedBiz && (
              <button type="button" onClick={() => { setSelectedBiz(null); setBizSearch(""); setShowBizList(false); }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            )}
            {showBizList && !selectedBiz && filteredBiz.length > 0 && (
              <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-52 overflow-y-auto">
                {filteredBiz.slice(0, 20).map((b) => (
                  <button key={b.id} type="button"
                    className="w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-brand-50 transition-colors border-b border-gray-50 last:border-0"
                    onClick={() => { setSelectedBiz(b); setBizSearch(""); setShowBizList(false); }}>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{b.name}</p>
                      <p className="text-xs text-gray-400">{b.industry}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
          {selectedBiz && (
            <p className="text-xs text-brand-600 font-semibold mt-1.5">
              ✓ {selectedBiz.name} · {selectedBiz.industry}
            </p>
          )}
        </div>

        {/* Event name */}
        <div>
          <label className={LABEL}>Event Name *</label>
          <input className={INPUT} value={name} onChange={(e) => setName(e.target.value)}
            placeholder="Summer Festival, Grand Opening…" required />
        </div>

        {/* Event type */}
        <div>
          <label className={LABEL}>Event Type *</label>
          <select className={INPUT} value={eventType} onChange={(e) => setEventType(e.target.value)} required>
            {EVENT_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={LABEL}>Start Date *</label>
            <input type="date" className={INPUT} value={eventDate} onChange={(e) => setEventDate(e.target.value)} required />
          </div>
          <div>
            <label className={LABEL}>End Date <span className="font-normal text-gray-400">(multi-day)</span></label>
            <input type="date" className={INPUT} value={endDate} min={eventDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>
        </div>

        {/* Times */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={LABEL}>Start Time *</label>
            <input type="time" className={INPUT} value={startTime} onChange={(e) => setStartTime(e.target.value)} required />
          </div>
          <div>
            <label className={LABEL}>End Time *</label>
            <input type="time" className={INPUT} value={endTime} onChange={(e) => setEndTime(e.target.value)} required />
          </div>
        </div>

        {/* Free / Ticketed */}
        <div>
          <label className={LABEL}>Entry</label>
          <div className="flex gap-3">
            <button type="button" onClick={() => setIsFree(true)}
              className={`flex-1 py-2.5 rounded-lg border text-sm font-semibold transition-colors ${isFree ? "bg-green-50 border-green-400 text-green-700" : "border-gray-200 text-gray-500 hover:bg-gray-50"}`}>
              Free
            </button>
            <button type="button" onClick={() => setIsFree(false)}
              className={`flex-1 py-2.5 rounded-lg border text-sm font-semibold transition-colors ${!isFree ? "bg-violet-50 border-violet-400 text-violet-700" : "border-gray-200 text-gray-500 hover:bg-gray-50"}`}>
              Paid / Ticketed
            </button>
          </div>
        </div>

        {/* Ticket price (shown only when paid) */}
        {!isFree && (
          <div>
            <label className={LABEL}>Ticket Price (₹) *</label>
            <input type="number" min="1" step="1" className={INPUT} value={ticketPrice}
              onChange={(e) => setTicketPrice(e.target.value)} placeholder="e.g. 500" required />
          </div>
        )}

        {/* Slots */}
        <div>
          <label className={LABEL}>Total Slots <span className="font-normal text-gray-400">(leave blank for unlimited)</span></label>
          <input type="number" min="1" step="1" className={INPUT} value={totalSlots}
            onChange={(e) => setTotalSlots(e.target.value)} placeholder="e.g. 200" />
        </div>

        {/* Description */}
        <div>
          <label className={LABEL}>Description</label>
          <textarea className={INPUT + " resize-none"} rows={3} value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What to expect, dress code, highlights…" maxLength={500} />
          <p className="text-xs text-gray-400 mt-1 text-right">{description.length}/500</p>
        </div>

        {/* Image */}
        <div>
          <label className={LABEL}>Event Photo</label>
          {imageUrl ? (
            <div className="relative w-full h-40 rounded-xl overflow-hidden border border-gray-200">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imageUrl} alt="Event" className="w-full h-full object-cover" />
              <button type="button" onClick={() => setImageUrl(null)}
                className="absolute top-2 right-2 w-7 h-7 bg-black/60 hover:bg-black/80 text-white rounded-full flex items-center justify-center">
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button type="button" onClick={() => imageRef.current?.click()} disabled={uploading}
              className="w-full h-28 rounded-xl border-2 border-dashed border-gray-200 hover:border-brand-300 flex flex-col items-center justify-center gap-1.5 text-gray-400 hover:text-brand-600 transition-colors">
              {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
              <span className="text-sm font-medium">{uploading ? "Uploading…" : "Upload event photo"}</span>
              <span className="text-xs">JPEG, PNG or WebP · max 5 MB</span>
            </button>
          )}
          <input ref={imageRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
        </div>

        {error && (
          <div className="px-4 py-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl">
            {error}
          </div>
        )}

        <div className="flex gap-3 pt-1">
          <Link href="/admin/events" className="btn-secondary text-sm flex-1 justify-center">Cancel</Link>
          <button type="submit" disabled={saving || !selectedBiz} className="btn-primary text-sm flex-1 justify-center disabled:opacity-50">
            {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</> : <><CalendarDays className="w-4 h-4" /> Create Event</>}
          </button>
        </div>
      </form>
    </div>
  );
}
