"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  PlusCircle, Home, Pencil, Trash2, Loader2, AlertCircle,
} from "lucide-react";
import clsx from "clsx";

interface Listing {
  id: string;
  status: string;
  listing_type: string;
  sub_category: string;
  property_type: string;
  price: string;
  project_name: string | null;
  standalone_description: string | null;
  tower: string | null;
  floor_number: number | null;
  carpet_area_sqft: number | null;
  bedrooms: string | null;
  contact_phone: string;
  photos: string[];
  created_at: string;
}

export default function BrokerListingsPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [confirm,  setConfirm]  = useState<string | null>(null);

  async function load() {
    setLoading(true);
    fetch("/api/broker/listings")
      .then((r) => r.json())
      .then((d) => { if (Array.isArray(d)) setListings(d); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, []);

  async function deleteListing(id: string) {
    setDeleting(id);
    await fetch(`/api/broker/listings/${id}`, { method: "DELETE" });
    setDeleting(null);
    setConfirm(null);
    load();
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-6 h-6 animate-spin text-brand-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">My Listings</h2>
          <p className="text-sm text-gray-400 mt-0.5">
            {listings.length} listing{listings.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Link href="/broker/listings/create" className="btn-primary text-sm py-2">
          <PlusCircle className="w-4 h-4" /> New Listing
        </Link>
      </div>

      {listings.length === 0 ? (
        <div className="card p-12 text-center">
          <Home className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <p className="font-semibold text-gray-500 mb-4">No listings yet</p>
          <Link href="/broker/listings/create" className="btn-primary text-sm">
            <PlusCircle className="w-4 h-4" /> Post Your First Listing
          </Link>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="divide-y divide-gray-50">
            {listings.map((l) => (
              <div key={l.id} className="px-6 py-4 flex items-center gap-4">
                {/* Thumbnail */}
                <div className="w-14 h-14 rounded-xl bg-gray-100 shrink-0 overflow-hidden">
                  {l.photos[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={l.photos[0]} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Home className="w-6 h-6 text-gray-300" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-gray-900 truncate">
                    {l.project_name ?? l.standalone_description ?? l.property_type}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5 capitalize">
                    {l.sub_category} · {l.listing_type === "sale" ? "For Sale" : "For Rent"}
                    {l.bedrooms ? ` · ${l.bedrooms} BHK` : ""}
                    {l.carpet_area_sqft ? ` · ${l.carpet_area_sqft} sqft` : ""}
                  </p>
                  <p className="text-sm font-bold text-brand-700 mt-0.5">₹{l.price}</p>
                </div>

                <span className={clsx(
                  "text-xs font-semibold px-2 py-0.5 rounded-full shrink-0",
                  l.status === "active"
                    ? "bg-green-100 text-green-700"
                    : "bg-amber-100 text-amber-700"
                )}>
                  {l.status}
                </span>

                <div className="flex items-center gap-2 shrink-0">
                  <Link
                    href={`/broker/listings/${l.id}/edit`}
                    className="p-2 rounded-lg text-gray-400 hover:bg-brand-50 hover:text-brand-600 transition-colors"
                    title="Edit"
                  >
                    <Pencil className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={() => setConfirm(l.id)}
                    className="p-2 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Delete confirm modal */}
      {confirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <h3 className="font-bold text-gray-900">Delete Listing</h3>
            </div>
            <p className="text-sm text-gray-500 mb-5">
              This listing will be permanently removed from the site. This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirm(null)}
                className="flex-1 btn-secondary text-sm"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteListing(confirm)}
                disabled={deleting === confirm}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold px-4 py-2 rounded-xl disabled:opacity-50"
              >
                {deleting === confirm ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
