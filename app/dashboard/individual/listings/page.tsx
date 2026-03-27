"use client";

import { useState } from "react";
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

const MOCK_LISTINGS = [
  {
    id: "l1",
    title: "3 BHK in Apex Tower — Tower B, 24th Floor",
    type: "Rent",
    price: "₹55,000/mo",
    status: "active" as const,
    views: 142,
    enquiries: 8,
    postedOn: "Mar 10, 2026",
    image: null,
    tower: "Apex Tower – Tower B",
    floor: "24",
    carpet: "1,450 sq ft",
  },
  {
    id: "l2",
    title: "2 BHK in Neopolis Heights — Tower A, 12th Floor",
    type: "Sale",
    price: "₹1.4 Cr",
    status: "active" as const,
    views: 89,
    enquiries: 3,
    postedOn: "Mar 15, 2026",
    image: null,
    tower: "Neopolis Heights – Tower A",
    floor: "12",
    carpet: "980 sq ft",
  },
  {
    id: "l3",
    title: "1 BHK in Neopolis Heights — Tower C, 7th Floor",
    type: "Rent",
    price: "₹22,000/mo",
    status: "inactive" as const,
    views: 34,
    enquiries: 1,
    postedOn: "Feb 28, 2026",
    image: null,
    tower: "Neopolis Heights – Tower C",
    floor: "7",
    carpet: "520 sq ft",
  },
];

export default function IndividualListings() {
  const [listings, setListings] = useState(MOCK_LISTINGS);

  function toggleStatus(id: string) {
    setListings((prev) =>
      prev.map((l) =>
        l.id === id
          ? { ...l, status: l.status === "active" ? "inactive" : "active" }
          : l
      )
    );
  }

  function remove(id: string) {
    if (confirm("Remove this listing?")) {
      setListings((prev) => prev.filter((l) => l.id !== id));
    }
  }

  return (
    <div className="max-w-3xl space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-gray-900">My Listings</h2>
          <p className="text-sm text-gray-400 mt-0.5">{listings.length} total · {listings.filter((l) => l.status === "active").length} active</p>
        </div>
        <Link href="/dashboard/individual/post" className="btn-primary text-sm py-2">
          <PlusCircle className="w-4 h-4" /> New Listing
        </Link>
      </div>

      {listings.length === 0 ? (
        <div className="card p-12 text-center">
          <Home className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="font-semibold text-gray-500">No listings yet</p>
          <Link href="/dashboard/individual/post" className="btn-primary text-sm mt-4 inline-flex">
            Post your first listing
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {listings.map((l) => (
            <div key={l.id} className={`card p-4 ${l.status === "inactive" ? "opacity-60" : ""}`}>
              <div className="flex gap-4">
                {/* Image placeholder */}
                <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-brand-100 to-brand-200 flex items-center justify-center shrink-0">
                  <Home className="w-8 h-8 text-brand-300" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-sm text-gray-900 leading-snug">{l.title}</h3>
                    <span className={l.status === "active" ? "tag-green shrink-0" : "tag-red shrink-0"}>
                      {l.status === "active" ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <span className={l.type === "Rent" ? "tag-green" : "tag-blue"}>{l.type}</span>
                    <span className="text-sm font-extrabold text-brand-700">{l.price}</span>
                    <span className="text-xs text-gray-400">{l.carpet}</span>
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                    <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> {l.views} views</span>
                    <span className="flex items-center gap-1"><MessageSquare className="w-3.5 h-3.5" /> {l.enquiries} enquiries</span>
                    <span>Posted {l.postedOn}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-50">
                <button
                  onClick={() => toggleStatus(l.id)}
                  className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-brand-700 transition-colors"
                >
                  {l.status === "active"
                    ? <ToggleRight className="w-4 h-4 text-green-500" />
                    : <ToggleLeft className="w-4 h-4 text-gray-400" />}
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
