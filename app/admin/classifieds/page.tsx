"use client";

import { useEffect, useState } from "react";
import {
  CheckCircle,
  XCircle,
  Clock,
  Home,
  Search,
  AlertCircle,
  Building2,
  Bed,
  Maximize2,
  IndianRupee,
  MapPin,
  Phone,
  BadgeCheck,
} from "lucide-react";
import clsx from "clsx";

interface Classified {
  id: string;
  owner_name: string;
  contact_phone: string;
  contact_preference: string;
  sub_category: string;
  listing_type: string;
  project_id: string | null;
  project_name: string | null;
  is_standalone: boolean;
  standalone_description: string | null;
  tower: string | null;
  floor_number: number | null;
  unit_number: string | null;
  property_type: string;
  bedrooms: string | null;
  bathrooms: string | null;
  carpet_area_sqft: number | null;
  parking: string | null;
  furnished: string | null;
  available_from: string | null;
  amenities: string[];
  price: string;
  deposit: string | null;
  description: string | null;
  owner_consent: boolean;
  consent_at: string | null;
  broker_id: string | null;
  broker?: { name: string; company_name: string | null; rera_number: string | null } | null;
  status: string;
  rejection_note: string | null;
  created_at: string;
  projects?: { project_name: string } | null;
}

function StatusBadge({ status }: { status: string }) {
  if (status === "active")   return <span className="inline-flex items-center gap-1 text-xs font-semibold bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded-full">Active</span>;
  if (status === "rejected") return <span className="inline-flex items-center gap-1 text-xs font-semibold bg-red-50 text-red-700 border border-red-200 px-2 py-0.5 rounded-full">Rejected</span>;
  return <span className="inline-flex items-center gap-1 text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full"><Clock className="w-3 h-3" />Pending</span>;
}

function propertyTitle(c: Classified): string {
  const bhk = c.bedrooms ? `${c.bedrooms} BHK ` : "";
  const type = c.property_type.replace("_", " ");
  return `${bhk}${type.charAt(0).toUpperCase() + type.slice(1)}`;
}

function locationLabel(c: Classified): string {
  if (c.is_standalone) return c.standalone_description ?? "Standalone property";
  const project = c.projects?.project_name ?? c.project_name ?? "Unknown project";
  const parts = [project];
  if (c.tower) parts.push(c.tower);
  if (c.floor_number) parts.push(`Floor ${c.floor_number}`);
  return parts.join(" · ");
}

export default function AdminClassifiedsPage() {
  const [items,    setItems]    = useState<Classified[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState("");
  const [filter,   setFilter]   = useState<"all" | "pending" | "active" | "rejected">("all");
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectNote, setRejectNote] = useState("");
  const [acting,   setActing]   = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/classifieds");
      const data = await res.json();
      setItems(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function verify(id: string) {
    setActing(id);
    await fetch(`/api/admin/classifieds/${id}/verify`, { method: "POST" });
    setActing(null);
    load();
  }

  async function reject(id: string) {
    setActing(id);
    await fetch(`/api/admin/classifieds/${id}/reject`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ note: rejectNote }),
    });
    setActing(null);
    setRejectId(null);
    setRejectNote("");
    load();
  }

  const pending  = items.filter((i) => i.status === "pending");
  const active   = items.filter((i) => i.status === "active");
  const rejected = items.filter((i) => i.status === "rejected");

  const q = search.toLowerCase();
  const filtered = items.filter((i) => {
    if (filter !== "all" && i.status !== filter) return false;
    if (q) {
      const hay = [
        i.owner_name, i.contact_phone, i.sub_category, i.listing_type,
        i.project_name, i.standalone_description, i.property_type, i.price,
      ].join(" ").toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Pending Review", value: pending.length,  icon: Clock,       color: "bg-amber-50 text-amber-600",  border: "border-amber-100" },
          { label: "Active / Live",  value: active.length,   icon: CheckCircle, color: "bg-green-50 text-green-600",  border: "border-green-100" },
          { label: "Rejected",       value: rejected.length, icon: XCircle,     color: "bg-red-50 text-red-500",      border: "border-red-100"   },
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
              {pending.length} Listing{pending.length !== 1 ? "s" : ""} Awaiting Review
            </p>
          </div>
          <div className="divide-y divide-amber-50">
            {pending.map((c) => (
              <div key={c.id} className="px-5 py-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    {/* Title row */}
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <p className="font-bold text-sm text-gray-900">{propertyTitle(c)}</p>
                      <span className={clsx(
                        "text-xs font-semibold px-2 py-0.5 rounded-full",
                        c.listing_type === "sale"
                          ? "bg-blue-50 text-blue-700"
                          : "bg-green-50 text-green-700"
                      )}>
                        For {c.listing_type === "sale" ? "Sale" : "Rent"}
                      </span>
                      <span className="text-xs font-semibold bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full capitalize">
                        {c.sub_category}
                      </span>
                    </div>

                    {/* Location */}
                    <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1.5">
                      <MapPin className="w-3 h-3 shrink-0" />
                      <span className="truncate">{locationLabel(c)}</span>
                    </div>

                    {/* Specs row */}
                    <div className="flex flex-wrap gap-3 text-xs text-gray-500 mb-1.5">
                      {c.bedrooms && (
                        <span className="flex items-center gap-1">
                          <Bed className="w-3 h-3" /> {c.bedrooms} BHK
                        </span>
                      )}
                      {c.carpet_area_sqft && (
                        <span className="flex items-center gap-1">
                          <Maximize2 className="w-3 h-3" /> {c.carpet_area_sqft} sq ft
                        </span>
                      )}
                      <span className="flex items-center gap-1 font-semibold text-brand-700">
                        <IndianRupee className="w-3 h-3" /> {c.price}
                        {c.listing_type === "rent" ? "/mo" : ""}
                      </span>
                    </div>

                    {/* Contact + source */}
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3" /> {c.owner_name} · +91{c.contact_phone}
                      </span>
                      {c.broker_id ? (
                        <span className="flex items-center gap-1 text-cyan-600 font-medium">
                          <BadgeCheck className="w-3 h-3" />
                          Broker — {c.broker?.company_name ?? c.broker?.name ?? "Licensed"}
                          {c.broker?.rera_number ? ` · ${c.broker.rera_number}` : ""}
                        </span>
                      ) : c.owner_consent ? (
                        <span className="flex items-center gap-1 text-green-600">
                          <CheckCircle className="w-3 h-3" /> Owner consent recorded
                          {c.consent_at && ` · ${new Date(c.consent_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}`}
                        </span>
                      ) : null}
                    </div>

                    {c.description && (
                      <p className="text-xs text-gray-500 mt-1.5 line-clamp-2">{c.description}</p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 shrink-0">
                    <button
                      onClick={() => verify(c.id)}
                      disabled={acting === c.id}
                      className="flex items-center gap-1.5 text-xs bg-green-600 hover:bg-green-700 text-white font-semibold px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                    >
                      <CheckCircle className="w-3.5 h-3.5" /> Verify
                    </button>
                    <button
                      onClick={() => { setRejectId(c.id); setRejectNote(""); }}
                      disabled={acting === c.id}
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

      {/* Full list */}
      <div className="card overflow-hidden">
        <div className="flex flex-wrap items-center gap-3 px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <Search className="w-4 h-4 text-gray-400 shrink-0" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search owner, project, price…"
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
          <div className="px-5 py-16 flex flex-col items-center text-center">
            <Home className="w-10 h-10 text-gray-200 mb-3" />
            <p className="text-sm text-gray-500 font-medium">
              {items.length === 0 ? "No listings yet" : "No results"}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {filtered.map((c) => (
              <div key={c.id} className="px-5 py-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-brand-50 flex items-center justify-center shrink-0">
                      <Building2 className="w-4.5 h-4.5 text-brand-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-0.5">
                        <p className="font-bold text-sm text-gray-900">{propertyTitle(c)}</p>
                        <StatusBadge status={c.status} />
                        <span className={clsx(
                          "text-xs font-semibold px-2 py-0.5 rounded-full",
                          c.listing_type === "sale" ? "bg-blue-50 text-blue-700" : "bg-green-50 text-green-700"
                        )}>
                          For {c.listing_type === "sale" ? "Sale" : "Rent"}
                        </span>
                        <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full capitalize">
                          {c.sub_category}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mb-1 truncate">{locationLabel(c)}</p>
                      <div className="flex flex-wrap gap-3 text-xs text-gray-400">
                        <span>{c.owner_name} · +91{c.contact_phone}</span>
                        <span className="font-semibold text-brand-700">
                          ₹{c.price}{c.listing_type === "rent" ? "/mo" : ""}
                        </span>
                        {c.broker_id ? (
                          <span className="flex items-center gap-1 text-cyan-600 font-medium">
                            <BadgeCheck className="w-3 h-3" />
                            {c.broker?.company_name ?? c.broker?.name ?? "Broker"}
                            {c.broker?.rera_number ? ` · ${c.broker.rera_number}` : ""}
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-green-600">
                            <CheckCircle className="w-3 h-3" /> Owner
                          </span>
                        )}
                        <span>{new Date(c.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                      </div>
                      {c.status === "rejected" && c.rejection_note && (
                        <p className="text-xs text-red-500 mt-1">Rejected: {c.rejection_note}</p>
                      )}
                    </div>
                  </div>
                  {c.status === "pending" && (
                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() => verify(c.id)}
                        disabled={acting === c.id}
                        className="text-xs bg-green-600 hover:bg-green-700 text-white font-semibold px-2.5 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                      >
                        Verify
                      </button>
                      <button
                        onClick={() => { setRejectId(c.id); setRejectNote(""); }}
                        disabled={acting === c.id}
                        className="text-xs border border-red-200 text-red-600 hover:bg-red-50 font-semibold px-2.5 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Reject modal */}
      {rejectId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <h3 className="font-bold text-gray-900 mb-1">Reject Listing</h3>
            <p className="text-xs text-gray-500 mb-4">
              Optionally provide a reason — it helps the owner understand what to fix.
            </p>
            <textarea
              value={rejectNote}
              onChange={(e) => setRejectNote(e.target.value)}
              placeholder="e.g. Incomplete details, suspected broker listing…"
              rows={3}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-400 mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={() => setRejectId(null)}
                className="flex-1 btn-secondary text-sm"
              >
                Cancel
              </button>
              <button
                onClick={() => reject(rejectId)}
                disabled={acting === rejectId}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors disabled:opacity-50"
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
