"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Heart, Loader2, Building2, Home, Trash2, ExternalLink, BellRing, Store, Phone, CalendarCheck } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { authHeaders } from "@/lib/authToken";

interface ProjectDetail {
  id: string;
  project_name: string;
  price_range_min: number | null;
  price_range_max: number | null;
  lifecycle_status: string | null;
}
interface ClassifiedDetail {
  id: string;
  project_name: string | null;
  standalone_description: string | null;
  property_type: string;
  listing_type: string;
  bedrooms: string | null;
  price: string;
  photos: string[];
  status: string;
}
interface BusinessDetail {
  id: string;
  name: string;
  industry: string | null;
  types: string[] | null;
  address: string | null;
  logo: string | null;
  contact_phone: string | null;
}
interface SavedItem {
  id: string;
  item_type: "project" | "classified" | "business";
  item_id: string;
  created_at: string;
  detail: ProjectDetail | ClassifiedDetail | BusinessDetail | null;
}
interface SearchAlert {
  id: string;
  email: string;
  sub_category: string | null;
  listing_type: string | null;
  bedrooms: string | null;
  created_at: string;
}

const LIFECYCLE_LABELS: Record<string, string> = {
  pre_launch:          "Pre-Launch",
  launched:            "Launched",
  under_construction:  "Under Construction",
  ready_to_move:       "Ready to Move",
  completed:           "Completed",
};

function formatCr(v: number | null) {
  if (v === null) return null;
  return v >= 100 ? `₹${(v / 100).toFixed(2)} Cr` : `₹${v} L`;
}

export default function SavedPropertiesPage() {
  const { user, loading: authLoading } = useAuth();
  const [items, setItems]     = useState<SavedItem[]>([]);
  const [alerts, setAlerts]   = useState<SearchAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const headers = await authHeaders();
    const [propsRes, alertsRes] = await Promise.all([
      fetch("/api/saved-properties?expand=1", { headers }).catch(() => null),
      fetch("/api/saved-searches", { headers }).catch(() => null),
    ]);
    if (propsRes?.ok) {
      const data = await propsRes.json();
      if (Array.isArray(data)) setItems(data);
    }
    if (alertsRes?.ok) {
      const data = await alertsRes.json();
      if (Array.isArray(data)) setAlerts(data);
    }
    setLoading(false);
  }, [user]);

  async function removeAlert(id: string) {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
    await fetch(`/api/saved-searches?id=${id}`, {
      method: "DELETE",
      headers: await authHeaders(),
    }).catch(() => null);
  }

  useEffect(() => { load(); }, [load]);

  async function remove(item: SavedItem) {
    setRemoving(item.id);
    const res = await fetch("/api/saved-properties", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(await authHeaders()) },
      body: JSON.stringify({ item_type: item.item_type, item_id: item.item_id }),
    }).catch(() => null);
    if (res?.ok) setItems((prev) => prev.filter((i) => i.id !== item.id));
    setRemoving(null);
  }

  if (authLoading || loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="w-6 h-6 animate-spin text-gray-300" />
      </div>
    );
  }

  const projects    = items.filter((i) => i.item_type === "project");
  const classifieds = items.filter((i) => i.item_type === "classified");
  const favourites  = items.filter((i) => i.item_type === "business");

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
          <Heart className="w-4 h-4 text-red-500" /> Saved & Favourites
        </h2>
        <p className="text-xs text-gray-400 mt-0.5">
          {items.length} saved · {favourites.length} places · {projects.length} projects · {classifieds.length} listings
        </p>
      </div>

      {items.length === 0 ? (
        <div className="card p-12 text-center">
          <Heart className="w-10 h-10 text-gray-200 mx-auto mb-3" />
          <p className="font-semibold text-gray-500 text-sm">Nothing saved yet</p>
          <p className="text-xs text-gray-400 mt-1 mb-4">
            Tap the ♥ Save button on any business, project or listing to shortlist it here.
          </p>
          <div className="flex justify-center gap-2">
            <Link href="/directory" className="btn-primary text-xs py-2">Browse Businesses</Link>
            <Link href="/real-estate" className="btn-secondary text-xs py-2">Browse Projects</Link>
          </div>
        </div>
      ) : (
        <>
          {favourites.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Favourite Places</h3>
              {favourites.map((item) => {
                const d = item.detail as BusinessDetail | null;
                return (
                  <div key={item.id} className="card p-4 flex items-center gap-3">
                    {d?.logo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={d.logo}
                        alt={d.name}
                        className="w-10 h-10 rounded-xl object-contain border border-gray-100 bg-white shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center shrink-0">
                        <Store className="w-5 h-5 text-purple-600" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm text-gray-900 truncate">
                        {d?.name ?? "Business no longer available"}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5 truncate">
                        {[d?.types?.[0] ?? d?.industry, d?.address].filter(Boolean).join(" · ")}
                      </p>
                    </div>
                    {d?.contact_phone && (
                      <a
                        href={`tel:${d.contact_phone}`}
                        className="shrink-0 flex items-center gap-1 text-xs font-bold text-gray-500 hover:text-gray-700"
                        title="Call"
                      >
                        <Phone className="w-3.5 h-3.5" /> Call
                      </a>
                    )}
                    {d && (
                      <Link
                        href={`/businesses/${d.id}`}
                        className="shrink-0 flex items-center gap-1 text-xs font-bold text-brand-600 hover:text-brand-800"
                        title="View page — book tickets, appointments or a table"
                      >
                        <CalendarCheck className="w-3.5 h-3.5" /> View & Book
                      </Link>
                    )}
                    <button
                      onClick={() => remove(item)}
                      disabled={removing === item.id}
                      className="shrink-0 text-gray-300 hover:text-red-500 transition-colors disabled:opacity-50"
                      title="Remove"
                    >
                      {removing === item.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
          {projects.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Projects</h3>
              {projects.map((item) => {
                const d = item.detail as ProjectDetail | null;
                return (
                  <div key={item.id} className="card p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-brand-100 flex items-center justify-center shrink-0">
                      <Building2 className="w-5 h-5 text-brand-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm text-gray-900 truncate">
                        {d?.project_name ?? "Project no longer available"}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {d?.lifecycle_status ? LIFECYCLE_LABELS[d.lifecycle_status] ?? d.lifecycle_status : ""}
                        {d?.price_range_min !== null && d?.price_range_min !== undefined && (
                          <> · {formatCr(d.price_range_min)}{d.price_range_max ? ` – ${formatCr(d.price_range_max)}` : ""}</>
                        )}
                      </p>
                    </div>
                    {d && (
                      <Link
                        href={`/real-estate/${d.id}`}
                        className="shrink-0 flex items-center gap-1 text-xs font-bold text-brand-600 hover:text-brand-800"
                      >
                        <ExternalLink className="w-3.5 h-3.5" /> View
                      </Link>
                    )}
                    <button
                      onClick={() => remove(item)}
                      disabled={removing === item.id}
                      className="shrink-0 text-gray-300 hover:text-red-500 transition-colors disabled:opacity-50"
                      title="Remove"
                    >
                      {removing === item.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {classifieds.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Listings</h3>
              {classifieds.map((item) => {
                const d = item.detail as ClassifiedDetail | null;
                return (
                  <div key={item.id} className="card p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center shrink-0">
                      <Home className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm text-gray-900 truncate capitalize">
                        {d
                          ? `${d.bedrooms ? `${d.bedrooms} BHK ` : ""}${d.property_type.replace("_", " ")} for ${d.listing_type}`
                          : "Listing no longer available"}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5 truncate">
                        {d?.project_name ?? d?.standalone_description ?? ""}
                        {d?.price && <> · {d.price}</>}
                      </p>
                    </div>
                    {d && d.status === "active" && (
                      <Link
                        href="/real-estate/classifieds"
                        className="shrink-0 flex items-center gap-1 text-xs font-bold text-brand-600 hover:text-brand-800"
                      >
                        <ExternalLink className="w-3.5 h-3.5" /> View
                      </Link>
                    )}
                    <button
                      onClick={() => remove(item)}
                      disabled={removing === item.id}
                      className="shrink-0 text-gray-300 hover:text-red-500 transition-colors disabled:opacity-50"
                      title="Remove"
                    >
                      {removing === item.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Search alerts */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
          <BellRing className="w-3.5 h-3.5 text-brand-500" /> Search Alerts
        </h3>
        {alerts.length === 0 ? (
          <p className="text-sm text-gray-400 px-1">
            No alerts set. Use &quot;Set Alert&quot; on the{" "}
            <Link href="/real-estate/classifieds" className="text-brand-600 hover:underline">listings page</Link>{" "}
            to get emailed when matching properties go live.
          </p>
        ) : (
          alerts.map((a) => (
            <div key={a.id} className="card p-4 flex items-center gap-3">
              <BellRing className="w-4 h-4 text-brand-400 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800 capitalize">
                  {[a.bedrooms && `${a.bedrooms} BHK`, a.sub_category, a.listing_type && `for ${a.listing_type}`]
                    .filter(Boolean)
                    .join(" ") || "Any new listing"}
                </p>
                <p className="text-xs text-gray-400 truncate">{a.email}</p>
              </div>
              <button
                onClick={() => removeAlert(a.id)}
                className="shrink-0 text-gray-300 hover:text-red-500 transition-colors"
                title="Stop alert"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
