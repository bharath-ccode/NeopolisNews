"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Heart, Loader2, Building2, Home, Trash2, ExternalLink } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

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
interface SavedItem {
  id: string;
  item_type: "project" | "classified";
  item_id: string;
  created_at: string;
  detail: ProjectDetail | ClassifiedDetail | null;
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
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const res = await fetch(`/api/saved-properties?user_id=${user.id}&expand=1`).catch(() => null);
    if (res?.ok) {
      const data = await res.json();
      if (Array.isArray(data)) setItems(data);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => { load(); }, [load]);

  async function remove(item: SavedItem) {
    setRemoving(item.id);
    const res = await fetch("/api/saved-properties", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: user!.id, item_type: item.item_type, item_id: item.item_id }),
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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
          <Heart className="w-4 h-4 text-red-500" /> Saved Properties
        </h2>
        <p className="text-xs text-gray-400 mt-0.5">
          {items.length} saved · {projects.length} projects · {classifieds.length} listings
        </p>
      </div>

      {items.length === 0 ? (
        <div className="card p-12 text-center">
          <Heart className="w-10 h-10 text-gray-200 mx-auto mb-3" />
          <p className="font-semibold text-gray-500 text-sm">Nothing saved yet</p>
          <p className="text-xs text-gray-400 mt-1 mb-4">
            Tap the ♥ Save button on any project or listing to shortlist it here.
          </p>
          <div className="flex justify-center gap-2">
            <Link href="/real-estate" className="btn-primary text-xs py-2">Browse Projects</Link>
            <Link href="/real-estate/classifieds" className="btn-secondary text-xs py-2">Browse Listings</Link>
          </div>
        </div>
      ) : (
        <>
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
    </div>
  );
}
