"use client";

import { useState } from "react";
import Link from "next/link";
import { CalendarCheck, ExternalLink, Loader2, CheckCircle, Sun, Sunset, Moon, ChevronUp, Trophy, PhoneCall } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const SLOTS = [
  { id: "morning",   label: "Morning",   time: "9 AM – 12 PM", icon: Sun    },
  { id: "afternoon", label: "Afternoon", time: "12 – 4 PM",    icon: Sunset },
  { id: "evening",   label: "Evening",   time: "4 – 8 PM",     icon: Moon   },
] as const;

function minDate() {
  return new Date().toISOString().split("T")[0];
}
function maxDate() {
  const d = new Date();
  d.setDate(d.getDate() + 30);
  return d.toISOString().split("T")[0];
}

const INPUT =
  "w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 " +
  "focus:outline-none focus:ring-2 focus:ring-brand-400";

/**
 * "Book Appointment" card on a business profile.
 * - booking_url set → deep-links to the business's own booking system.
 * - claimed, no booking_url → request-a-slot form; the business confirms
 *   by phone from their /my-business dashboard.
 * - unclaimed → no request form. Nobody can see appointment_requests for
 *   a business with no owner logged in yet, so a submitted request would
 *   silently go nowhere — point the visitor at the call button instead.
 */
export default function BookAppointment({
  businessId,
  businessName,
  bookingUrl,
  claimed,
}: {
  businessId: string;
  businessName: string;
  bookingUrl: string | null;
  claimed: boolean;
}) {
  const { user } = useAuth();
  const [open, setOpen]       = useState(false);
  const [name, setName]       = useState("");
  const [phone, setPhone]     = useState("");
  const [date, setDate]       = useState("");
  const [slot, setSlot]       = useState<string>("morning");
  const [note, setNote]       = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError]     = useState("");
  const [done, setDone]       = useState(false);

  // Path A: the business uses its own booking system — just link out.
  if (bookingUrl) {
    return (
      <div className="card p-6">
        <h2 className="font-bold text-gray-900 text-base mb-1 flex items-center gap-2">
          <CalendarCheck className="w-4 h-4 text-brand-600" /> Appointments
        </h2>
        <p className="text-xs text-gray-400 mb-4">
          {businessName} takes bookings through their own system.
        </p>
        <a
          href={bookingUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary text-sm w-full justify-center"
        >
          Book Appointment <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    );
  }

  // Unclaimed — no owner is logged in to see a request, so don't collect one.
  if (!claimed) {
    return (
      <div className="card p-6">
        <h2 className="font-bold text-gray-900 text-base mb-1 flex items-center gap-2">
          <CalendarCheck className="w-4 h-4 text-brand-600" /> Appointments
        </h2>
        <p className="text-xs text-gray-500 flex items-start gap-1.5">
          <PhoneCall className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" />
          This listing hasn&apos;t been claimed by {businessName} yet, so appointment
          requests aren&apos;t being monitored. Use the call button above to book directly.
        </p>
      </div>
    );
  }

  // Path B: request a slot; the business confirms by phone.
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!name.trim())  { setError("Please enter your name."); return; }
    if (!/^[\d\s+\-()]{8,15}$/.test(phone.trim())) { setError("Please enter a valid phone number."); return; }
    if (!date)         { setError("Please pick a date."); return; }
    setSending(true);
    const res = await fetch(`/api/businesses/${businessId}/appointments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customer_name:  name.trim(),
        customer_phone: phone.trim(),
        preferred_date: date,
        preferred_slot: slot,
        note:           note.trim() || undefined,
      }),
    }).catch(() => null);
    if (!res?.ok) {
      const j = res ? await res.json().catch(() => ({})) : {};
      setError((j as { error?: string }).error ?? "Request failed. Please try again.");
      setSending(false);
      return;
    }
    setDone(true);
    setSending(false);
  }

  if (done) {
    return (
      <div className="card p-6 text-center">
        <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
        <p className="font-bold text-gray-900 text-sm mb-1">Request sent!</p>
        <p className="text-xs text-gray-500">
          {businessName} will call you to confirm your{" "}
          {SLOTS.find((s) => s.id === slot)?.label.toLowerCase()} appointment on{" "}
          {new Date(date).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}.
        </p>
      </div>
    );
  }

  return (
    <div className="card p-6">
      <h2 className="font-bold text-gray-900 text-base mb-1 flex items-center gap-2">
        <CalendarCheck className="w-4 h-4 text-brand-600" /> Appointments
      </h2>
      <p className="text-xs text-gray-400 mb-4">
        Pick a day and time — {businessName} confirms by phone.
      </p>

      {!open ? (
        <>
          <button onClick={() => setOpen(true)} className="btn-primary text-sm w-full justify-center">
            <CalendarCheck className="w-4 h-4" /> Request Appointment
          </button>
          <p className="text-[11px] text-gray-400 mt-2 flex items-center gap-1">
            <Trophy className="w-3 h-3 text-amber-400 shrink-0" />
            {user ? (
              <>Earn Neopolis Points when your visit is completed.</>
            ) : (
              <><Link href="/auth/login" className="text-brand-600 hover:underline font-semibold">Sign in</Link>&nbsp;first to earn Neopolis Points when you visit.</>
            )}
          </p>
        </>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="text" value={name} onChange={(e) => setName(e.target.value)}
            placeholder="Your name *" maxLength={80} className={INPUT}
          />
          <input
            type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
            placeholder="Phone number *" maxLength={15} className={INPUT}
          />
          <input
            type="date" value={date} min={minDate()} max={maxDate()}
            onChange={(e) => setDate(e.target.value)} className={INPUT}
          />
          <div className="grid grid-cols-3 gap-2">
            {SLOTS.map(({ id, label, time, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setSlot(id)}
                className={`rounded-xl border px-1 py-2 text-center transition-colors ${
                  slot === id
                    ? "border-brand-500 bg-brand-50 text-brand-700"
                    : "border-gray-200 text-gray-500 hover:border-brand-300"
                }`}
              >
                <Icon className="w-3.5 h-3.5 mx-auto mb-0.5" />
                <span className="block text-[11px] font-bold">{label}</span>
                <span className="block text-[9px] text-gray-400">{time}</span>
              </button>
            ))}
          </div>
          <textarea
            value={note} onChange={(e) => setNote(e.target.value)}
            rows={2} maxLength={300}
            placeholder="What's it for? (optional)"
            className={`${INPUT} resize-none`}
          />
          {error && (
            <p className="text-red-600 text-xs bg-red-50 border border-red-200 rounded-xl px-3 py-2">{error}</p>
          )}
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={sending}
              className="flex-1 btn-primary text-sm justify-center disabled:opacity-60"
            >
              {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Send Request"}
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="px-3 text-gray-400 hover:text-gray-600"
              aria-label="Collapse"
            >
              <ChevronUp className="w-4 h-4" />
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
