"use client";

import { useEffect, useState } from "react";
import {
  CalendarCheck, Phone, Loader2, CheckCircle2, XCircle, Hourglass, Flag, Clock,
} from "lucide-react";
import clsx from "clsx";

interface Booking {
  id: string;
  customer_name: string;
  customer_phone: string;
  preferred_date: string;
  preferred_slot: "morning" | "afternoon" | "evening";
  note: string | null;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  created_at: string;
}

const SLOT_LABELS = { morning: "Morning (9–12)", afternoon: "Afternoon (12–4)", evening: "Evening (4–8)" };

const STATUS_META = {
  pending:   { label: "New",       icon: Hourglass,    cls: "bg-amber-50 text-amber-700" },
  confirmed: { label: "Confirmed", icon: CheckCircle2, cls: "bg-green-50 text-green-700" },
  completed: { label: "Done",      icon: Flag,         cls: "bg-blue-50 text-blue-700" },
  cancelled: { label: "Cancelled", icon: XCircle,      cls: "bg-gray-100 text-gray-500" },
} as const;

export default function BookingsTab({
  businessId,
  token,
}: {
  businessId: string;
  token: string;
}) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading]   = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/my-business/appointments?businessId=${businessId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setBookings(data); })
      .finally(() => setLoading(false));
  }, [businessId, token]);

  async function setStatus(id: string, status: Booking["status"]) {
    setUpdating(id);
    const res = await fetch("/api/my-business/appointments", {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ businessId, id, status }),
    }).catch(() => null);
    if (res?.ok) setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status } : b)));
    setUpdating(null);
  }

  const pending = bookings.filter((b) => b.status === "pending").length;

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="w-6 h-6 animate-spin text-gray-300" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base font-bold text-gray-900">Appointment Requests</h3>
        <p className="text-xs text-gray-400 mt-0.5">
          {bookings.length} total · {pending} awaiting confirmation. Call the customer to
          confirm, then mark the request. Marking Done awards the customer Neopolis Points
          for the visit.
        </p>
      </div>

      {bookings.length === 0 ? (
        <div className="card p-12 text-center">
          <CalendarCheck className="w-10 h-10 text-gray-200 mx-auto mb-3" />
          <p className="font-semibold text-gray-500 text-sm">No appointment requests yet</p>
          <p className="text-xs text-gray-400 mt-1">
            Customers request slots from your public profile — they&apos;ll appear here.
            If you use a booking system, add its link in the Profile tab instead.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {bookings.map((b) => {
            const meta = STATUS_META[b.status];
            return (
              <div key={b.id} className="card p-5">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className={clsx("inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full", meta.cls)}>
                    <meta.icon className="w-3 h-3" /> {meta.label}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-gray-400 ml-auto">
                    <Clock className="w-3 h-3" />
                    requested {new Date(b.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                  </span>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-bold text-sm text-gray-900">{b.customer_name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {new Date(b.preferred_date).toLocaleDateString("en-IN", {
                        weekday: "short", day: "numeric", month: "short",
                      })}{" "}
                      · {SLOT_LABELS[b.preferred_slot]}
                    </p>
                    {b.note && <p className="text-xs text-gray-400 mt-1">&ldquo;{b.note}&rdquo;</p>}
                  </div>
                  <a
                    href={`tel:${b.customer_phone}`}
                    className="flex items-center gap-1.5 btn-primary text-xs py-2"
                  >
                    <Phone className="w-3.5 h-3.5" /> Call to confirm
                  </a>
                </div>

                {(b.status === "pending" || b.status === "confirmed") && (
                  <div className="flex gap-2 mt-3 pt-3 border-t border-gray-50">
                    {b.status === "pending" && (
                      <button
                        onClick={() => setStatus(b.id, "confirmed")}
                        disabled={updating === b.id}
                        className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Mark Confirmed
                      </button>
                    )}
                    {b.status === "confirmed" && (
                      <button
                        onClick={() => setStatus(b.id, "completed")}
                        disabled={updating === b.id}
                        className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors"
                      >
                        <Flag className="w-3.5 h-3.5" /> Mark Done
                      </button>
                    )}
                    <button
                      onClick={() => setStatus(b.id, "cancelled")}
                      disabled={updating === b.id}
                      className="flex items-center gap-1.5 border border-gray-200 hover:bg-red-50 hover:border-red-200 hover:text-red-600 text-gray-500 text-xs font-bold px-4 py-2 rounded-lg transition-colors"
                    >
                      <XCircle className="w-3.5 h-3.5" /> Cancel
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
