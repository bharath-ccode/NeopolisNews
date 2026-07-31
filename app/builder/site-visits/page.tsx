"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  CalendarCheck, Phone, Loader2, ArrowLeft, Building2,
  CheckCircle2, XCircle, Hourglass, Flag,
} from "lucide-react";
import clsx from "clsx";
import { useBuilderAuth } from "@/context/BuilderAuthContext";

interface Booking {
  id: string;
  project_id: string;
  project_name: string;
  visitor_name: string;
  visitor_phone: string;
  preferred_date: string;
  preferred_slot: "morning" | "afternoon" | "evening";
  note: string | null;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  created_at: string;
}

const SLOT_LABELS = { morning: "Morning (9–12)", afternoon: "Afternoon (12–4)", evening: "Evening (4–7)" };

const STATUS_META = {
  pending:   { label: "Pending",   icon: Hourglass,    cls: "bg-amber-50 text-amber-700" },
  confirmed: { label: "Confirmed", icon: CheckCircle2, cls: "bg-green-50 text-green-700" },
  completed: { label: "Completed", icon: Flag,         cls: "bg-blue-50 text-blue-700" },
  cancelled: { label: "Cancelled", icon: XCircle,      cls: "bg-gray-100 text-gray-500" },
} as const;

export default function BuilderSiteVisitsPage() {
  const { builder } = useBuilderAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading]   = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!builder) return;
    setLoading(true);
    const res = await fetch(`/api/builder/site-visits?builder_id=${builder.id}`).catch(() => null);
    if (res?.ok) {
      const data = await res.json();
      if (Array.isArray(data)) setBookings(data);
    }
    setLoading(false);
  }, [builder]);

  useEffect(() => { load(); }, [load]);

  async function setStatus(id: string, status: Booking["status"]) {
    setUpdating(id);
    const res = await fetch("/api/builder/site-visits", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    }).catch(() => null);
    if (res?.ok) setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status } : b)));
    setUpdating(null);
  }

  const pending = bookings.filter((b) => b.status === "pending").length;
  const upcoming = bookings.filter((b) => b.status === "confirmed").length;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center gap-3">
        <Link href="/builder" className="text-gray-400 hover:text-gray-600 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="font-bold text-gray-900 flex items-center gap-2">
            <CalendarCheck className="w-4 h-4 text-brand-500" /> Site Visits
          </h1>
          <p className="text-xs text-gray-400">
            {bookings.length} total · {pending} pending · {upcoming} confirmed
          </p>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-8">
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-gray-300" />
          </div>
        ) : bookings.length === 0 ? (
          <div className="card p-12 text-center">
            <CalendarCheck className="w-10 h-10 text-gray-200 mx-auto mb-3" />
            <p className="font-semibold text-gray-500 text-sm">No site visits booked yet</p>
            <p className="text-xs text-gray-400 mt-1">
              Visitors book from your project pages — bookings appear here.
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
                    <span className="inline-flex items-center gap-1 text-xs text-gray-500 font-semibold">
                      <Building2 className="w-3 h-3" /> {b.project_name}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="font-bold text-sm text-gray-900">{b.visitor_name}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {new Date(b.preferred_date).toLocaleDateString("en-IN", {
                          weekday: "short", day: "numeric", month: "short",
                        })}{" "}
                        · {SLOT_LABELS[b.preferred_slot]}
                      </p>
                      {b.note && <p className="text-xs text-gray-400 mt-1">&ldquo;{b.note}&rdquo;</p>}
                    </div>
                    <a
                      href={`tel:${b.visitor_phone}`}
                      className="flex items-center gap-1.5 btn-secondary text-xs py-2"
                    >
                      <Phone className="w-3.5 h-3.5" /> {b.visitor_phone}
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
                          <CheckCircle2 className="w-3.5 h-3.5" /> Confirm
                        </button>
                      )}
                      {b.status === "confirmed" && (
                        <button
                          onClick={() => setStatus(b.id, "completed")}
                          disabled={updating === b.id}
                          className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors"
                        >
                          <Flag className="w-3.5 h-3.5" /> Mark Completed
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
    </div>
  );
}
