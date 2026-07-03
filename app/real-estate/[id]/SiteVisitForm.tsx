"use client";

import { useState } from "react";
import { CalendarCheck, Loader2, CheckCircle, Sun, Sunset, Moon } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const SLOTS = [
  { id: "morning",   label: "Morning",   time: "9 AM – 12 PM", icon: Sun    },
  { id: "afternoon", label: "Afternoon", time: "12 – 4 PM",    icon: Sunset },
  { id: "evening",   label: "Evening",   time: "4 – 7 PM",     icon: Moon   },
] as const;

function minDate() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split("T")[0];
}
function maxDate() {
  const d = new Date();
  d.setDate(d.getDate() + 60);
  return d.toISOString().split("T")[0];
}

const INPUT =
  "w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 " +
  "focus:outline-none focus:ring-2 focus:ring-brand-400";

export default function SiteVisitForm({
  projectId,
  projectName,
}: {
  projectId: string;
  projectName: string;
}) {
  const { user } = useAuth();

  const [name, setName]   = useState("");
  const [phone, setPhone] = useState("");
  const [date, setDate]   = useState("");
  const [slot, setSlot]   = useState<string>("morning");
  const [note, setNote]   = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError]     = useState("");
  const [done, setDone]       = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!name.trim())  { setError("Please enter your name."); return; }
    if (!/^[\d\s+\-()]{8,15}$/.test(phone.trim())) { setError("Please enter a valid phone number."); return; }
    if (!date)         { setError("Please pick a date."); return; }
    setSending(true);
    const res = await fetch(`/api/projects/${projectId}/site-visits`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        visitor_name:   name.trim(),
        visitor_phone:  phone.trim(),
        preferred_date: date,
        preferred_slot: slot,
        note:           note.trim() || undefined,
        user_id:        user?.id,
      }),
    }).catch(() => null);
    if (!res?.ok) {
      const j = res ? await res.json().catch(() => ({})) : {};
      setError((j as { error?: string }).error ?? "Booking failed. Please try again.");
      setSending(false);
      return;
    }
    setDone(true);
    setSending(false);
  }

  if (done) {
    return (
      <div className="bg-white rounded-2xl p-8 text-center">
        <CheckCircle className="w-10 h-10 text-green-500 mx-auto mb-3" />
        <h3 className="font-extrabold text-gray-900 text-lg mb-1">Site visit requested!</h3>
        <p className="text-sm text-gray-500">
          The {projectName} team will call you to confirm your visit on{" "}
          <span className="font-semibold text-gray-700">
            {new Date(date).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}
          </span>{" "}
          ({SLOTS.find((s) => s.id === slot)?.label.toLowerCase()}).
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6">
      <h3 className="font-extrabold text-gray-900 text-lg mb-1 flex items-center gap-2">
        <CalendarCheck className="w-5 h-5 text-brand-600" /> Book a Site Visit
      </h3>
      <p className="text-sm text-gray-400 mb-5">
        Pick a day and time — the builder&apos;s team confirms by phone.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid sm:grid-cols-2 gap-3">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name *"
            maxLength={80}
            className={INPUT}
          />
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Phone number *"
            maxLength={15}
            className={INPUT}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">Preferred date *</label>
          <input
            type="date"
            value={date}
            min={minDate()}
            max={maxDate()}
            onChange={(e) => setDate(e.target.value)}
            className={INPUT}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">Preferred time *</label>
          <div className="grid grid-cols-3 gap-2">
            {SLOTS.map(({ id, label, time, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setSlot(id)}
                className={`rounded-xl border px-2 py-2.5 text-center transition-colors ${
                  slot === id
                    ? "border-brand-500 bg-brand-50 text-brand-700"
                    : "border-gray-200 text-gray-500 hover:border-brand-300"
                }`}
              >
                <Icon className="w-4 h-4 mx-auto mb-1" />
                <span className="block text-xs font-bold">{label}</span>
                <span className="block text-[10px] text-gray-400">{time}</span>
              </button>
            ))}
          </div>
        </div>

        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={2}
          maxLength={500}
          placeholder="Anything the team should know? (optional)"
          className={`${INPUT} resize-none`}
        />

        {error && (
          <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">{error}</p>
        )}

        <button
          type="submit"
          disabled={sending}
          className="w-full flex items-center justify-center gap-2 bg-brand-700 hover:bg-brand-800 disabled:opacity-60 text-white font-bold py-3 rounded-xl transition-colors text-sm"
        >
          {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <CalendarCheck className="w-4 h-4" />}
          {sending ? "Booking…" : "Request Site Visit"}
        </button>
      </form>
    </div>
  );
}
