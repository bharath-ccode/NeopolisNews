"use client";

import { useEffect, useState } from "react";
import {
  CheckCircle, XCircle, Clock, Search, AlertCircle, UserCheck,
  Building2, Phone,
} from "lucide-react";
import clsx from "clsx";

interface Broker {
  id: string;
  name: string;
  company_name: string | null;
  phone: string;
  email: string;
  rera_number: string | null;
  status: "pending" | "approved" | "rejected";
  rejection_note: string | null;
  approved_at: string | null;
  created_at: string;
}

function StatusBadge({ status }: { status: string }) {
  if (status === "approved")
    return <span className="inline-flex items-center gap-1 text-xs font-semibold bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded-full">Approved</span>;
  if (status === "rejected")
    return <span className="inline-flex items-center gap-1 text-xs font-semibold bg-red-50 text-red-700 border border-red-200 px-2 py-0.5 rounded-full">Rejected</span>;
  return <span className="inline-flex items-center gap-1 text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full"><Clock className="w-3 h-3" />Pending</span>;
}

export default function AdminBrokersPage() {
  const [brokers,    setBrokers]    = useState<Broker[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState("");
  const [filter,     setFilter]     = useState<"all" | "pending" | "approved" | "rejected">("all");
  const [rejectId,   setRejectId]   = useState<string | null>(null);
  const [rejectNote, setRejectNote] = useState("");
  const [acting,     setActing]     = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const data = await fetch("/api/admin/brokers").then((r) => r.json());
      setBrokers(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function approve(id: string) {
    setActing(id);
    await fetch(`/api/admin/brokers/${id}/approve`, { method: "POST" });
    setActing(null);
    load();
  }

  async function reject(id: string) {
    setActing(id);
    await fetch(`/api/admin/brokers/${id}/reject`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ note: rejectNote }),
    });
    setActing(null);
    setRejectId(null);
    setRejectNote("");
    load();
  }

  const pending  = brokers.filter((b) => b.status === "pending");
  const approved = brokers.filter((b) => b.status === "approved");
  const rejected = brokers.filter((b) => b.status === "rejected");

  const q = search.toLowerCase();
  const filtered = brokers.filter((b) => {
    if (filter !== "all" && b.status !== filter) return false;
    if (q && ![b.name, b.email, b.company_name ?? "", b.rera_number ?? ""].join(" ").toLowerCase().includes(q)) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Pending",  value: pending.length,  icon: Clock,       color: "bg-amber-50 text-amber-600",  border: "border-amber-100"  },
          { label: "Approved", value: approved.length, icon: CheckCircle, color: "bg-green-50 text-green-600",  border: "border-green-100"  },
          { label: "Rejected", value: rejected.length, icon: XCircle,     color: "bg-red-50 text-red-500",      border: "border-red-100"    },
        ].map((s) => (
          <div key={s.label} className={`card p-4 flex items-center gap-3 border ${s.border}`}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${s.color}`}>
              <s.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-extrabold text-gray-900">{s.value}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Pending queue */}
      {pending.length > 0 && (
        <div className="card overflow-hidden border-amber-200">
          <div className="flex items-center gap-2 px-5 py-3 bg-amber-50 border-b border-amber-100">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <p className="text-sm font-bold text-amber-900">
              {pending.length} Broker Application{pending.length !== 1 ? "s" : ""} Awaiting Review
            </p>
          </div>
          <div className="divide-y divide-amber-50">
            {pending.map((broker) => (
              <div key={broker.id} className="px-5 py-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                      <UserCheck className="w-5 h-5 text-gray-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-0.5">
                        <p className="font-bold text-sm text-gray-900">{broker.name}</p>
                        {broker.company_name && (
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <Building2 className="w-3 h-3" />{broker.company_name}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-3 text-xs text-gray-400 mt-1">
                        <span>{broker.email}</span>
                        <span className="flex items-center gap-1"><Phone className="w-3 h-3" />+91{broker.phone}</span>
                        {broker.rera_number && (
                          <span className="text-brand-600 font-medium">RERA: {broker.rera_number}</span>
                        )}
                        <span>{new Date(broker.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 shrink-0">
                    <button
                      onClick={() => approve(broker.id)}
                      disabled={acting === broker.id}
                      className="flex items-center gap-1.5 text-xs bg-green-600 hover:bg-green-700 text-white font-semibold px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                    >
                      <CheckCircle className="w-3.5 h-3.5" /> Approve
                    </button>
                    <button
                      onClick={() => { setRejectId(broker.id); setRejectNote(""); }}
                      disabled={acting === broker.id}
                      className="flex items-center gap-1.5 text-xs border border-red-200 text-red-600 hover:bg-red-50 font-semibold px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                    >
                      <XCircle className="w-3.5 h-3.5" /> Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All brokers list */}
      <div className="card overflow-hidden">
        <div className="flex flex-wrap items-center gap-3 px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <Search className="w-4 h-4 text-gray-400 shrink-0" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, email, company, RERA…"
              className="flex-1 text-sm outline-none text-gray-700 placeholder-gray-400"
            />
          </div>
          <div className="flex rounded-lg border border-gray-200 overflow-hidden text-xs">
            {(["all", "pending", "approved", "rejected"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={clsx(
                  "px-3 py-1.5 font-semibold capitalize transition-colors",
                  filter === f ? "bg-brand-600 text-white" : "text-gray-500 hover:bg-gray-50"
                )}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="px-5 py-16 text-center text-gray-400 text-sm">Loading…</div>
        ) : filtered.length === 0 ? (
          <div className="px-5 py-16 text-center">
            <UserCheck className="w-10 h-10 text-gray-200 mx-auto mb-3" />
            <p className="text-sm text-gray-500">
              {brokers.length === 0 ? "No broker applications yet" : "No results"}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {filtered.map((broker) => (
              <div key={broker.id} className="px-5 py-4 flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                    <UserCheck className="w-4 h-4 text-gray-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-0.5">
                      <p className="font-bold text-sm text-gray-900">{broker.name}</p>
                      <StatusBadge status={broker.status} />
                      {broker.company_name && (
                        <span className="text-xs text-gray-500">{broker.company_name}</span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-3 text-xs text-gray-400">
                      <span>{broker.email}</span>
                      <span>+91{broker.phone}</span>
                      {broker.rera_number && <span className="text-brand-600 font-medium">RERA: {broker.rera_number}</span>}
                      <span>{new Date(broker.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>
                    </div>
                    {broker.status === "rejected" && broker.rejection_note && (
                      <p className="text-xs text-red-500 mt-1">Rejected: {broker.rejection_note}</p>
                    )}
                  </div>
                </div>
                {broker.status === "pending" && (
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => approve(broker.id)}
                      disabled={acting === broker.id}
                      className="text-xs bg-green-600 hover:bg-green-700 text-white font-semibold px-2.5 py-1.5 rounded-lg disabled:opacity-50"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => { setRejectId(broker.id); setRejectNote(""); }}
                      disabled={acting === broker.id}
                      className="text-xs border border-red-200 text-red-600 hover:bg-red-50 font-semibold px-2.5 py-1.5 rounded-lg disabled:opacity-50"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Reject modal */}
      {rejectId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <h3 className="font-bold text-gray-900 mb-1">Reject Broker Application</h3>
            <p className="text-xs text-gray-500 mb-4">Optional reason — sent to the applicant.</p>
            <textarea
              value={rejectNote}
              onChange={(e) => setRejectNote(e.target.value)}
              placeholder="e.g. Invalid RERA number, incomplete information…"
              rows={3}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-400 mb-4"
            />
            <div className="flex gap-3">
              <button onClick={() => setRejectId(null)} className="flex-1 btn-secondary text-sm">Cancel</button>
              <button
                onClick={() => reject(rejectId)}
                disabled={acting === rejectId}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold px-4 py-2 rounded-xl disabled:opacity-50"
              >
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
