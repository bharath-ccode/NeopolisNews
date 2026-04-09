"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  PlusCircle,
  Eye,
  MessageSquare,
  Pencil,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Home,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import {
  getUserListings,
  updateListing,
  deleteListing,
  type Listing,
} from "@/lib/listings";

export default function IndividualListings() {
  const { user } = useAuth();
  const [listings, setListings] = useState<Listing[]>([]);

  useEffect(() => {
    if (user) setListings(getUserListings(user.id));
  }, [user]);

  function toggleStatus(id: string) {
    const listing = listings.find((l) => l.id === id);
    if (!listing) return;
    const next = listing.status === "active" ? "inactive" : "active";
    updateListing(id, { status: next });
    setListings((prev) =>
      prev.map((l) => (l.id === id ? { ...l, status: next } : l))
    );
  }

  function remove(id: string) {
    if (!confirm("Remove this listing?")) return;
    deleteListing(id);
    setListings((prev) => prev.filter((l) => l.id !== id));
  }

  function formatDate(iso: string) {
    try {
      return new Date(iso).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return iso;
    }
  }

  function listingTitle(l: Listing) {
    const bhk =
      l.propertyType === "apartment" || l.propertyType === "villa"
        ? `${l.bedrooms} BHK `
        : "";
    return `${bhk}${l.propertyType.charAt(0).toUpperCase() + l.propertyType.slice(1)} in ${l.projectName} — ${l.tower}, Floor ${l.floor}`;
  }

  return (
    <div className="max-w-3xl space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-gray-900">My Listings</h2>
          <p className="text-sm text-gray-400 mt-0.5">
            {listings.length} total · {listings.filter((l) => l.status === "active").length} active
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
          <Link
            href="/dashboard/individual/post"
            className="btn-primary text-sm mt-4 inline-flex"
          >
            Post your first listing
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {listings.map((l) => (
            <div
              key={l.id}
              className={`card p-4 ${l.status === "inactive" ? "opacity-60" : ""}`}
            >
              <div className="flex gap-4">
                {/* Image placeholder */}
                <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-brand-100 to-brand-200 flex items-center justify-center shrink-0">
                  <Home className="w-8 h-8 text-brand-300" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-sm text-gray-900 leading-snug">
                      {listingTitle(l)}
                    </h3>
                    <span
                      className={
                        l.status === "active"
                          ? "tag-green shrink-0"
                          : "tag-red shrink-0"
                      }
                    >
                      {l.status === "active" ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <span
                      className={
                        l.listingType === "rent" ? "tag-green" : "tag-blue"
                      }
                    >
                      {l.listingType === "rent" ? "Rent" : "Sale"}
                    </span>
                    <span className="text-sm font-extrabold text-brand-700">
                      ₹{l.price}
                      {l.listingType === "rent" ? "/mo" : ""}
                    </span>
                    {l.carpetArea && (
                      <span className="text-xs text-gray-400">
                        {l.carpetArea} sq ft
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5" /> {l.views} views
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageSquare className="w-3.5 h-3.5" /> {l.enquiries} enquiries
                    </span>
                    <span>Posted {formatDate(l.postedOn)}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-50">
                <button
                  onClick={() => toggleStatus(l.id)}
                  className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-brand-700 transition-colors"
                >
                  {l.status === "active" ? (
                    <ToggleRight className="w-4 h-4 text-green-500" />
                  ) : (
                    <ToggleLeft className="w-4 h-4 text-gray-400" />
                  )}
                  {l.status === "active" ? "Deactivate" : "Activate"}
                </button>
                <span className="text-gray-200">|</span>
                <button className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-brand-700 transition-colors">
                  <Pencil className="w-3.5 h-3.5" /> Edit
                </button>
                <span className="text-gray-200">|</span>
                <button
                  onClick={() => remove(l.id)}
                  className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-red-600 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Remove
                </button>
                <span className="ml-auto text-xs text-gray-400">
                  {l.tower} · Floor {l.floor}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
