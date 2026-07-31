"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PlusCircle, ListChecks, ArrowRight, Home, TrendingUp } from "lucide-react";
import { useBrokerAuth } from "@/context/BrokerAuthContext";

interface Listing {
  id: string;
  status: string;
  listing_type: string;
  sub_category: string;
  property_type: string;
  price: string;
  project_name: string | null;
  standalone_description: string | null;
  created_at: string;
}

export default function BrokerDashboard() {
  const { broker } = useBrokerAuth();
  const [listings, setListings] = useState<Listing[]>([]);

  useEffect(() => {
    fetch("/api/broker/listings")
      .then((r) => r.json())
      .then((d) => { if (Array.isArray(d)) setListings(d); })
      .catch(() => {});
  }, []);

  const active   = listings.filter((l) => l.status === "active").length;
  const total    = listings.length;
  const recent   = listings.slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Welcome, {broker?.name?.split(" ")[0]}
          </h2>
          {broker?.companyName && (
            <p className="text-gray-500 text-sm mt-0.5">{broker.companyName}</p>
          )}
          {broker?.reraNumber && (
            <p className="text-xs text-brand-600 font-medium mt-0.5">RERA: {broker.reraNumber}</p>
          )}
        </div>
        <Link href="/broker/listings/create" className="btn-primary text-sm py-2 self-start sm:self-auto">
          <PlusCircle className="w-4 h-4" />
          New Listing
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="card p-5">
          <div className="w-9 h-9 rounded-xl bg-brand-50 flex items-center justify-center mb-3">
            <Home className="w-4 h-4 text-brand-600" />
          </div>
          <p className="text-3xl font-extrabold text-gray-900">{total}</p>
          <p className="text-xs text-gray-500 mt-0.5">Total Listings</p>
        </div>
        <div className="card p-5">
          <div className="w-9 h-9 rounded-xl bg-green-50 flex items-center justify-center mb-3">
            <TrendingUp className="w-4 h-4 text-green-600" />
          </div>
          <p className="text-3xl font-extrabold text-gray-900">{active}</p>
          <p className="text-xs text-gray-500 mt-0.5">Live Listings</p>
        </div>
      </div>

      {/* Quick links */}
      <div className="grid sm:grid-cols-2 gap-4">
        <Link
          href="/broker/listings/create"
          className="card p-5 flex items-center gap-4 hover:border-brand-300 group"
        >
          <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center shrink-0 group-hover:bg-brand-100 transition-colors">
            <PlusCircle className="w-5 h-5 text-brand-600" />
          </div>
          <div>
            <p className="font-semibold text-gray-900 text-sm">Post New Listing</p>
            <p className="text-xs text-gray-400">Goes live immediately</p>
          </div>
          <ArrowRight className="w-4 h-4 text-gray-300 ml-auto group-hover:text-brand-500 transition-colors" />
        </Link>

        <Link
          href="/broker/listings"
          className="card p-5 flex items-center gap-4 hover:border-brand-300 group"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0 group-hover:bg-blue-100 transition-colors">
            <ListChecks className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="font-semibold text-gray-900 text-sm">Manage Listings</p>
            <p className="text-xs text-gray-400">Edit or remove listings</p>
          </div>
          <ArrowRight className="w-4 h-4 text-gray-300 ml-auto group-hover:text-brand-500 transition-colors" />
        </Link>
      </div>

      {/* Recent listings */}
      {recent.length > 0 && (
        <div className="card overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Recent Listings</h3>
            <Link href="/broker/listings" className="text-sm text-brand-600 hover:underline font-medium">
              View all
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {recent.map((l) => (
              <div key={l.id} className="px-6 py-4 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-medium text-sm text-gray-900 truncate">
                    {l.project_name ?? l.standalone_description ?? l.property_type}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5 capitalize">
                    {l.sub_category} · {l.listing_type === "sale" ? "For Sale" : "For Rent"} · ₹{l.price}
                  </p>
                </div>
                <Link
                  href={`/broker/listings/${l.id}/edit`}
                  className="text-xs text-brand-600 hover:underline shrink-0 font-medium"
                >
                  Edit
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
