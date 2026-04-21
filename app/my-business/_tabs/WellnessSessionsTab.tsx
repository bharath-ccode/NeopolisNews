"use client";

import { useState, useEffect } from "react";
import { Video, Plus, Trash2, Loader2, Zap, Square, ExternalLink, Users } from "lucide-react";
import { detectProvider } from "@/lib/videoProviders";

interface WellnessSession {
  id: string;
  trainer_name: string;
  session_type: string;
  language: string;
  description: string | null;
  price_inr: number;
  max_seats: number;
  seats_taken: number;
  meeting_link: string | null;
  platform: string;
  platform_label: string;
  start_date: string;
  end_date: string;
  status: "draft" | "live" | "ended" | "cancelled";
}

const INPUT = "w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 text-gray-800";
const LABEL = "block text-xs font-semibold text-gray-500 mb-1.5";

const SESSION_TYPES = [
  "Yoga", "Pilates", "Meditation", "Breathwork & Pranayama",
  "CrossFit", "Functional Training", "Zumba & Dance", "Martial Arts",
  "Stretching & Flexibility", "Cycling", "Sound Healing", "General Fitness",
];
const LANGUAGES = ["English", "Hindi", "Telugu", "Tamil", "Kannada", "Malayalam"];

const STATUS_STYLE: Record<string, string> = {
  draft:     "bg-gray-100 text-gray-600",
  live:      "bg-green-100 text-green-700",
  ended:     "bg-amber-100 text-amber-700",
  cancelled: "bg-red-100 text-red-600",
};

function today() { return new Date().toISOString().slice(0, 10); }
function minEnd(from: string) {
  const d = new Date(from);
  d.setDate(d.getDate() + 7);
  return d.toISOString().slice(0, 10);
}
function maxEnd(from: string) {
  const d = new Date(from);
  d.setDate(d.getDate() + 90);
  return d.toISOString().slice(0, 10);
}

export default function WellnessSessionsTab({ businessId, token }: { businessId: string; token: string }) {
  const [sessions, setSessions] = useState<WellnessSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);

  const [trainerName, setTrainerName] = useState("");
  const [sessionType, setSessionType] = useState(SESSION_TYPES[0]);
  const [language, setLanguage] = useState("English");
  const [description, setDescription] = useState("");
  const [priceInr, setPriceInr] = useState("");
  const [maxSeats, setMaxSeats] = useState("20");
  const [meetingLink, setMeetingLink] = useState("");
  const [startDate, setStartDate] = useState(today());
  const [endDate, setEndDate] = useState(minEnd(today()));

  const providerInfo = meetingLink.trim() ? detectProvider(meetingLink.trim()) : null;

  useEffect(() => {
    fetch(`/api/my-business/wellness-sessions?businessId=${businessId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => { setSessions(Array.isArray(data) ? data : []); setLoading(false); });
  }, [businessId, token]);

  function resetForm() {
    setTrainerName(""); setSessionType(SESSION_TYPES[0]); setLanguage("English");
    setDescription(""); setPriceInr(""); setMaxSeats("20");
    setMeetingLink(""); setStartDate(today()); setEndDate(minEnd(today()));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!trainerName || !priceInr || !startDate || !endDate) return;
    setSaving(true);
    const res = await fetch("/api/my-business/wellness-sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        businessId, trainer_name: trainerName, session_type: sessionType,
        language, description: description || null,
        price_inr: parseInt(priceInr), max_seats: parseInt(maxSeats),
        meeting_link: meetingLink.trim() || null, start_date: startDate, end_date: endDate,
      }),
    });
    if (res.ok) {
      const s = await res.json();
      setSessions((prev) => [s, ...prev]);
      resetForm();
      setShowForm(false);
    }
    setSaving(false);
  }

  async function setStatus(id: string, status: string) {
    setActionId(id);
    const res = await fetch(`/api/my-business/wellness-sessions/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ businessId, status }),
    });
    if (res.ok) {
      const updated = await res.json();
      setSessions((prev) => prev.map((s) => (s.id === id ? updated : s)));
    }
    setActionId(null);
  }

  async function handleDelete(id: string) {
    setActionId(id);
    await fetch(`/api/my-business/wellness-sessions/${id}?businessId=${businessId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    setSessions((prev) => prev.filter((s) => s.id !== id));
    setActionId(null);
  }

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-brand-500" /></div>;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-gray-900">Live Sessions</h3>
          <p className="text-xs text-gray-400 mt-0.5">{sessions.length} session{sessions.length !== 1 ? "s" : ""} created</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary text-sm py-2">
          <Plus className="w-4 h-4" /> New Session
        </button>
      </div>

      {showForm && (
        <div className="card p-5">
          <h4 className="font-semibold text-gray-900 text-sm mb-4">Create Session</h4>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className={LABEL}>Trainer Name *</label>
                <input className={INPUT} value={trainerName} onChange={(e) => setTrainerName(e.target.value)} placeholder="Priya Sharma" required />
              </div>
              <div>
                <label className={LABEL}>Session Type *</label>
                <select className={INPUT} value={sessionType} onChange={(e) => setSessionType(e.target.value)}>
                  {SESSION_TYPES.map((t) => <option key={t}>{t}</option>)}
                </select>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className={LABEL}>Language</label>
                <select className={INPUT} value={language} onChange={(e) => setLanguage(e.target.value)}>
                  {LANGUAGES.map((l) => <option key={l}>{l}</option>)}
                </select>
              </div>
              <div>
                <label className={LABEL}>Price (₹ / month) *</label>
                <input type="number" min="0" className={INPUT} value={priceInr} onChange={(e) => setPriceInr(e.target.value)} placeholder="2500" required />
              </div>
            </div>

            <div>
              <label className={LABEL}>Max Seats</label>
              <input type="number" min="1" max="500" className={INPUT} value={maxSeats} onChange={(e) => setMaxSeats(e.target.value)} />
            </div>

            <div>
              <label className={LABEL}>Meeting Link</label>
              <input
                type="url"
                className={INPUT}
                value={meetingLink}
                onChange={(e) => setMeetingLink(e.target.value)}
                placeholder="https://zoom.us/j/… or meet.google.com/… or teams.microsoft.com/…"
              />
              {providerInfo && (
                <div className={`mt-2 inline-flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full border ${providerInfo.color}`}>
                  <Video className="w-3.5 h-3.5" />
                  {providerInfo.label} · {providerInfo.note}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={LABEL}>Start Date *</label>
                <input
                  type="date"
                  className={INPUT}
                  value={startDate}
                  min={today()}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    setEndDate(minEnd(e.target.value));
                  }}
                  required
                />
              </div>
              <div>
                <label className={LABEL}>End Date * <span className="font-normal text-gray-400">(7–90 days)</span></label>
                <input
                  type="date"
                  className={INPUT}
                  value={endDate}
                  min={minEnd(startDate)}
                  max={maxEnd(startDate)}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <label className={LABEL}>Description</label>
              <textarea className={INPUT + " resize-none"} rows={3} value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What will participants learn or experience in this session?" maxLength={400} />
            </div>

            <div className="flex gap-3 pt-1">
              <button type="button" onClick={() => { resetForm(); setShowForm(false); }} className="btn-secondary text-sm flex-1">Cancel</button>
              <button type="submit" disabled={saving} className="btn-primary text-sm flex-1">
                {saving ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Save as Draft"}
              </button>
            </div>
          </form>
        </div>
      )}

      {sessions.length === 0 && !showForm ? (
        <div className="card p-10 text-center border-dashed">
          <Video className="w-8 h-8 text-gray-200 mx-auto mb-2" />
          <p className="text-sm text-gray-500">No sessions yet. Create your first live session and go live to start enrolling residents.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sessions.map((s) => (
            <div key={s.id} className="card p-4">
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${STATUS_STYLE[s.status]}`}>
                      {s.status.charAt(0).toUpperCase() + s.status.slice(1)}
                    </span>
                    <span className="text-xs font-semibold text-brand-600 bg-brand-50 border border-brand-100 px-2 py-0.5 rounded-full">{s.session_type}</span>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border bg-gray-50 text-gray-600`}>
                      {s.platform_label}
                    </span>
                  </div>
                  <p className="font-bold text-sm text-gray-900">{s.trainer_name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {new Date(s.start_date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })} –{" "}
                    {new Date(s.end_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    {" · "}{s.language}
                  </p>
                  <div className="flex items-center gap-4 mt-1.5">
                    <span className="text-sm font-bold text-gray-900">₹{s.price_inr.toLocaleString("en-IN")}<span className="text-xs font-normal text-gray-400">/mo</span></span>
                    <span className="flex items-center gap-1 text-xs text-gray-500">
                      <Users className="w-3.5 h-3.5" /> {s.seats_taken}/{s.max_seats} enrolled
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-1.5 shrink-0">
                  {s.status === "draft" && (
                    <button
                      onClick={() => setStatus(s.id, "live")}
                      disabled={actionId === s.id}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg transition-colors"
                    >
                      {actionId === s.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Zap className="w-3 h-3" />}
                      Go Live
                    </button>
                  )}
                  {s.status === "live" && (
                    <>
                      {s.meeting_link && (
                        <a href={s.meeting_link} target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-semibold bg-brand-600 hover:bg-brand-700 text-white px-3 py-1.5 rounded-lg transition-colors">
                          <ExternalLink className="w-3 h-3" /> Open Link
                        </a>
                      )}
                      <button
                        onClick={() => setStatus(s.id, "ended")}
                        disabled={actionId === s.id}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        {actionId === s.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Square className="w-3 h-3" />}
                        End
                      </button>
                    </>
                  )}
                  {(s.status === "draft" || s.status === "ended") && (
                    <button
                      onClick={() => handleDelete(s.id)}
                      disabled={actionId === s.id}
                      className="p-1.5 rounded-lg text-gray-300 hover:bg-red-50 hover:text-red-500 transition-colors self-end"
                    >
                      {actionId === s.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
