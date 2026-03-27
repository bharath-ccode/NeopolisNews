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
  ShoppingBag,
} from "lucide-react";

const MOCK = [
  {
    id: "c1",
    title: "2,500 sq ft Grade A Office Space — Business Park Block B",
    category: "Office Leasing",
    price: "₹2.8L/mo",
    placement: "Featured",
    status: "active" as const,
    views: 312,
    leads: 14,
    postedOn: "Mar 12, 2026",
    expiresOn: "Apr 12, 2026",
  },
  {
    id: "c2",
    title: "Grand Opening: Cult.fit Neopolis — Join Now at ₹1,499/mo",
    category: "Fitness & Wellness",
    price: "₹1,499/mo",
    placement: "Homepage Spot",
    status: "active" as const,
    views: 890,
    leads: 67,
    postedOn: "Mar 18, 2026",
    expiresOn: "Mar 25, 2026",
  },
  {
    id: "c3",
    title: "Interior Design Services — Residential & Commercial",
    category: "Interior & Fit-Out",
    price: "Starting ₹2.5L",
    placement: "Standard",
    status: "paused" as const,
    views: 180,
    leads: 9,
    postedOn: "Feb 20, 2026",
    expiresOn: "May 20, 2026",
  },
];

const PLACEMENT_COLOR: Record<string, string> = {
  Standard: "tag-blue",
  Featured: "tag-orange",
  "Homepage Spot": "tag-purple",
};

export default function BusinessClassifieds() {
  const [items, setItems] = useState(MOCK);

  function toggle(id: string) {
    setItems((prev) =>
      prev.map((c) =>
        c.id === id
          ? { ...c, status: c.status === "active" ? "paused" : "active" }
          : c
      )
    );
  }

  function remove(id: string) {
    if (confirm("Delete this classified?")) {
      setItems((prev) => prev.filter((c) => c.id !== id));
    }
  }

  return (
    <div className="max-w-3xl space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-gray-900">My Classifieds</h2>
          <p className="text-sm text-gray-400 mt-0.5">
            {items.length} total · {items.filter((c) => c.status === "active").length} active
          </p>
        </div>
        <Link href="/dashboard/business/post" className="btn-primary text-sm py-2">
          <PlusCircle className="w-4 h-4" /> New Classified
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="card p-12 text-center">
          <ShoppingBag className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="font-semibold text-gray-500">No classifieds yet</p>
          <Link href="/dashboard/business/post" className="btn-primary text-sm mt-4 inline-flex">
            Post your first classified
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((c) => (
            <div key={c.id} className={`card p-4 ${c.status === "paused" ? "opacity-60" : ""}`}>
              <div className="flex gap-4">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center shrink-0">
                  <ShoppingBag className="w-7 h-7 text-purple-300" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-sm text-gray-900 leading-snug">{c.title}</h3>
                    <span className={c.status === "active" ? "tag-green shrink-0" : "tag-orange shrink-0"}>
                      {c.status === "active" ? "Active" : "Paused"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className="tag-purple">{c.category}</span>
                    <span className={PLACEMENT_COLOR[c.placement] ?? "tag-blue"}>{c.placement}</span>
                    <span className="text-xs font-bold text-brand-700">{c.price}</span>
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-400 flex-wrap">
                    <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> {c.views} views</span>
                    <span className="flex items-center gap-1"><MessageSquare className="w-3.5 h-3.5" /> {c.leads} leads</span>
                    <span>Posted {c.postedOn}</span>
                    <span>Expires {c.expiresOn}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-50">
                <button onClick={() => toggle(c.id)} className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-brand-700 transition-colors">
                  {c.status === "active"
                    ? <ToggleRight className="w-4 h-4 text-green-500" />
                    : <ToggleLeft className="w-4 h-4 text-gray-400" />}
                  {c.status === "active" ? "Pause" : "Activate"}
                </button>
                <span className="text-gray-200">|</span>
                <button className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-brand-700 transition-colors">
                  <Pencil className="w-3.5 h-3.5" /> Edit
                </button>
                <span className="text-gray-200">|</span>
                <button onClick={() => remove(c.id)} className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-red-600 transition-colors">
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
                <Link href="/advertise" className="ml-auto text-xs text-brand-600 font-semibold hover:underline">
                  Upgrade placement →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
