"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  PlusCircle, Home, Clock, CheckCircle, XCircle,
  Trash2, Loader2, AlertCircle, MapPin, Bed, Maximize2,
} from "lucide-react";
import clsx from "clsx";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/context/AuthContext";

interface Classified {
  id: string;
  sub_category: string;
  listing_type: string;
  property_type: string;
  bedrooms: string | null;
  carpet_area_sqft: number | null;
  project_name: string | null;
  standalone_description: string | null;
  is_standalone: boolean;
  tower: string | null;
  floor_number: number | null;
  price: string;
  status: string;
  rejection_note: string | null;
  created_at: string;
}

function StatusBadge({ status }: { status: string }) {
  if (status === "active")
    return <span className="inline-flex items-center gap-1 text-xs font-semibold bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded-full"><CheckCircle className="w-3 h-3" />Live</span>;
  if (status === "rejected")
    return <span className="inline-flex items-center gap-1 text-xs font-semibold bg-red-50 text-red-700 border border-red-200 px-2 py-0.5 rounded-full"><XCircle className="w-3 h-3" />Rejected</span>;
  return <span className="inline-flex items-center gap-1 text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full"><Clock className="w-3 h-3" />Pending review</span>;
}

function listingTitle(c: Classified): string {
  const bhk = c.bedrooms ? `${c.bedrooms} BHK ` : "";
  return `${bhk}${c.property_type.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}`;
}

function locationLabel(c: Classified): string {
  if (c.is_standalone) return c.standalone_description ?? "Standalone property";
  const parts: string[] = [];
  if (c.project_name) parts.push(c.project_name);
  if (c.tower) parts.push(c.tower);
  if (c.floor_number !== null) parts.push(`Floor ${c.floor_number}`);
  return parts.join(" · ") || "Neopolis";
}

export default function IndividualListings() {
  const { user } = useAuth();
  const [listings,  setListings]  = useState<Classified[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [deleting,  setDeleting]  = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    const sb = createClient();
    sb.from("classifieds")
      .select("id, sub_category, listing_type, property_type, bedrooms, carpet_area_sqft, project_name, standalone_description, is_standalone, tower, floor_number, price, status, rejection_note, created_at")
      .eq("user_id", user.id)
      .is("broker_id", null)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setListings((data as Classified[]) ?? []);
        setLoading(false);
      });
  }, [user]);

  async function deleteListing(id: string) {
    setDeleting(id);
    const res = await fetch(`/api/classifieds/${id}`, { method: "DELETE" });
    if (res.ok) {
      setListings((prev) => prev.filter((l) => l.id !== id));
    }
    setDeleting(null);
    setConfirmId(null);
  }

  const active  = listings.filter((l) => l.status === "active").length;
  const pending = listings.filter((l) => l.status === "pending").length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-6 h-6 animate-spin text-brand-500" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-gray-900">My Listings</h2>
          <p className="text-sm text-gray-400 mt-0.5">
            {listings.length} total · {active} live · {pending} pending review
          </p>
        </div>
        <Link href="/dashboard/individual/post" className="btn-primary text-sm py-2">
          <PlusCircle className="w-4 h-4" /> New Listing
        </Link>
      </div>

      {listings.length === 0 ? (
        <div className="card p-12 text-center">
          <Home className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="font-semibold text-gray-500">No listings yet</p>
          <p className="text-xs text-gray-400 mt-1">
            Post your first property to reach buyers and tenants.
          </p>
          <Link href="/dashboard/individual/post" className="btn-primary text-sm mt-4 inline-flex">
            Post your first listing
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {listings.map((l) => (
            <div key={l.id} className={clsx("card p-4", l.status === "rejected" && "border-red-100")}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center shrink-0">
                    <Home className="w-5 h-5 text-brand-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-0.5">
                      <p className="font-bold text-sm text-gray-900">{listingTitle(l)}</p>
                      <StatusBadge status={l.status} />
                      <span className={clsx(
                        "text-xs font-semibold px-2 py-0.5 rounded-full",
                        l.listing_type === "sale" ? "bg-blue-50 text-blue-700" : "bg-green-50 text-green-700"
                      )}>
                        For {l.listing_type === "sale" ? "Sale" : "Rent"}
                      </span>
                      <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full capitalize">
                        {l.sub_category}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-xs text-gray-500 mb-1.5">
                      <MapPin className="w-3 h-3 shrink-0" />
                      <span className="truncate">{locationLabel(l)}</span>
                    </div>

                    <div className="flex flex-wrap gap-3 text-xs text-gray-400">
                      {l.bedrooms && (
                        <span className="flex items-center gap-1"><Bed className="w-3 h-3" />{l.bedrooms} BHK</span>
                      )}
                      {l.carpet_area_sqft && (
                        <span className="flex items-center gap-1"><Maximize2 className="w-3 h-3" />{l.carpet_area_sqft} sqft</span>
                      )}
                      <span className="font-semibold text-brand-700">
                        ₹{l.price}{l.listing_type === "rent" ? "/mo" : ""}
                      </span>
                      <span>{new Date(l.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                    </div>

                    {l.status === "rejected" && l.rejection_note && (
                      <p className="text-xs text-red-600 mt-1.5 flex items-start gap-1">
                        <AlertCircle className="w-3 h-3 shrink-0 mt-0.5" />
                        {l.rejection_note}
                      </p>
                    )}

                    {l.status === "pending" && (
                      <p className="text-xs text-amber-600 mt-1.5">
                        Under review — usually verified within 24 hours.
                      </p>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => setConfirmId(l.id)}
                  className="p-2 rounded-lg text-gray-300 hover:bg-red-50 hover:text-red-500 transition-colors shrink-0"
                  title="Delete listing"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete confirm modal */}
      {confirmId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <h3 className="font-bold text-gray-900">Delete Listing</h3>
            </div>
            <p className="text-sm text-gray-500 mb-5">
              This listing will be permanently removed. This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmId(null)} className="flex-1 btn-secondary text-sm">
                Cancel
              </button>
              <button
                onClick={() => deleteListing(confirmId)}
                disabled={deleting === confirmId}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold px-4 py-2 rounded-xl disabled:opacity-50"
              >
                {deleting === confirmId ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
