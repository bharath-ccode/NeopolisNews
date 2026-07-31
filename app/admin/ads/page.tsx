"use client";

import { useEffect, useState } from "react";
import {
  CheckCircle, XCircle, Clock, Tag, Search, AlertCircle, Car,
  Bike, Sofa, Tv, Zap, Phone,
} from "lucide-react";
import clsx from "clsx";

interface Ad {
  id: string;
  owner_name: string;
  contact_phone: string;
  category: string;
  title: string;
  description: string;
  price: string | null;
  photos: string[];
  duration_days: number;
  expires_at: string | null;
  status: string;
  rejection_note: string | null;
  verified_at: string | null;
  created_at: string;
}

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  cars: Car, bikes: Bike, furniture: Sofa,
  electronics: Tv, appliances: Zap, others: Tag,
};

function StatusBadge({ status }: { status: string }) {
  if (status === "active")   return <span className="inline-flex items-center gap-1 text-xs font-semibold bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded-full">Active</span>;
  if (status === "rejected") return <span className="inline-flex items-center gap-1 text-xs font-semibold bg-red-50 text-red-700 border border-red-200 px-2 py-0.5 rounded-full">Rejected</span>;
  return <span className="inline-flex items-center gap-1 text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full"><Clock className="w-3 h-3" />Pending</span>;
}

export default function AdminAdsPage() {
  const [ads,       setAds]       = useState<Ad[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [search,    setSearch]    = useState("");
  const [filter,    setFilter]    = useState<"all" | "pending" | "active" | "rejected">("all");
  const [rejectId,  setRejectId]  = useState<string | null>(null);
  const [rejectNote,setRejectNote]= useState("");
  const [acting,    setActing]    = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const data = await fetch("/api/admin/ads").then((r) => r.json());
      setAds(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function verify(id: string) {
    setActing(id);
    await fetch(`/api/admin/ads/${id}/verify`, { method: "POST" });
    setActing(null);
    load();
  }

  async function reject(id: string) {
    setActing(id);
    await fetch(`/api/admin/ads/${id}/reject`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ note: rejectNote }),
    });
    setActing(null);
    setRejectId(null);
    setRejectNote("");
    load();
  }

  const pending  = ads.filter((a) => a.status === "pending");
  const active   = ads.filter((a) => a.status === "active");
  const rejected = ads.filter((a) => a.status === "rejected");

  const q = search.toLowerCase();
  const filtered = ads.filter((a) => {
    if (filter !== "all" && a.status !== filter) return false;
    if (q && ![a.title, a.description, a.owner_name, a.category].join(" ").toLowerCase().includes(q)) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Pending",  value: pending.length,  icon: Clock,        color: "bg-amber-50 text-amber-600", border: "border-amber-100" },
          { label: "Active",   value: active.length,   icon: CheckCircle,  color: "bg-green-50 text-green-600", border: "border-green-100" },
          { label: "Rejected", value: rejected.length, icon: XCircle,      color: "bg-red-50 text-red-500",     border: "border-red-100"   },
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
              {pending.length} Ad{pending.length !== 1 ? "s" : ""} Awaiting Review
            </p>
          </div>
          <div className="divide-y divide-amber-50">
            {pending.map((ad) => {
              const CatIcon = CATEGORY_ICONS[ad.category] ?? Tag;
              return (
                <div key={ad.id} className="px-5 py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      {/* Photo or icon */}
                      <div className="w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center shrink-0 overflow-hidden">
                        {ad.photos[0] ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={ad.photos[0]} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <CatIcon className="w-6 h-6 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-0.5">
                          <p className="font-bold text-sm text-gray-900 truncate">{ad.title}</p>
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full capitalize">
                            {ad.category}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 line-clamp-2 mb-1">{ad.description}</p>
                        <div className="flex flex-wrap gap-3 text-xs text-gray-400">
                          {ad.price && <span className="font-semibold text-brand-700">₹{ad.price}</span>}
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3" /> {ad.owner_name} · +91{ad.contact_phone}
                          </span>
                          <span><Clock className="w-3 h-3 inline mr-0.5" />{ad.duration_days}-day run</span>
                          <span>{ad.photos.length} photo{ad.photos.length !== 1 ? "s" : ""}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 shrink-0">
                      <button
                        onClick={() => verify(ad.id)}
                        disabled={acting === ad.id}
                        className="flex items-center gap-1.5 text-xs bg-green-600 hover:bg-green-700 text-white font-semibold px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                      >
                        <CheckCircle className="w-3.5 h-3.5" /> Approve
                      </button>
                      <button
                        onClick={() => { setRejectId(ad.id); setRejectNote(""); }}
                        disabled={acting === ad.id}
                        className="flex items-center gap-1.5 text-xs border border-red-200 text-red-600 hover:bg-red-50 font-semibold px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                      >
                        <XCircle className="w-3.5 h-3.5" /> Reject
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* All ads list */}
      <div className="card overflow-hidden">
        <div className="flex flex-wrap items-center gap-3 px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <Search className="w-4 h-4 text-gray-400 shrink-0" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search title, category, owner…"
              className="flex-1 text-sm outline-none text-gray-700 placeholder-gray-400"
            />
          </div>
          <div className="flex rounded-lg border border-gray-200 overflow-hidden text-xs">
            {(["all", "pending", "active", "rejected"] as const).map((f) => (
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
            <Tag className="w-10 h-10 text-gray-200 mx-auto mb-3" />
            <p className="text-sm text-gray-500">
              {ads.length === 0 ? "No ads submitted yet" : "No results"}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {filtered.map((ad) => {
              const CatIcon = CATEGORY_ICONS[ad.category] ?? Tag;
              return (
                <div key={ad.id} className="px-5 py-4 flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center shrink-0 overflow-hidden">
                      {ad.photos[0] ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={ad.photos[0]} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <CatIcon className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-0.5">
                        <p className="font-bold text-sm text-gray-900 truncate">{ad.title}</p>
                        <StatusBadge status={ad.status} />
                        <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full capitalize">{ad.category}</span>
                      </div>
                      <div className="flex flex-wrap gap-3 text-xs text-gray-400">
                        <span>{ad.owner_name} · +91{ad.contact_phone}</span>
                        {ad.price && <span className="text-brand-700 font-semibold">₹{ad.price}</span>}
                        <span>{ad.duration_days}-day run</span>
                        <span>{new Date(ad.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>
                        {ad.expires_at && <span>Expires {new Date(ad.expires_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>}
                      </div>
                      {ad.status === "rejected" && ad.rejection_note && (
                        <p className="text-xs text-red-500 mt-1">Rejected: {ad.rejection_note}</p>
                      )}
                    </div>
                  </div>
                  {ad.status === "pending" && (
                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() => verify(ad.id)}
                        disabled={acting === ad.id}
                        className="text-xs bg-green-600 hover:bg-green-700 text-white font-semibold px-2.5 py-1.5 rounded-lg disabled:opacity-50"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => { setRejectId(ad.id); setRejectNote(""); }}
                        disabled={acting === ad.id}
                        className="text-xs border border-red-200 text-red-600 hover:bg-red-50 font-semibold px-2.5 py-1.5 rounded-lg disabled:opacity-50"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Reject modal */}
      {rejectId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <h3 className="font-bold text-gray-900 mb-1">Reject Ad</h3>
            <p className="text-xs text-gray-500 mb-4">Optional reason for rejection.</p>
            <textarea
              value={rejectNote}
              onChange={(e) => setRejectNote(e.target.value)}
              placeholder="e.g. Incomplete description, invalid contact…"
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
