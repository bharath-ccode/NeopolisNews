"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Home,
  Phone,
  MessageCircle,
  Bed,
  Maximize2,
  Car,
  MapPin,
  PlusCircle,
  Building2,
  CheckCircle,
  BadgeCheck,
} from "lucide-react";
import clsx from "clsx";
import { createClient } from "@/lib/supabase/client";

interface BrokerInfo {
  name: string;
  company_name: string | null;
  rera_number: string | null;
}

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
  broker_id: string | null;
  broker: BrokerInfo | null;
  created_at: string;
}

type SubTab    = "all" | "residential" | "retail" | "office";
type TypeFilter = "all" | "sale" | "rent";

function locationLabel(c: Classified): string {
  if (c.is_standalone) return c.standalone_description ?? "Standalone property";
  const parts: string[] = [];
  if (c.project_name) parts.push(c.project_name);
  if (c.tower)        parts.push(c.tower);
  if (c.floor_number !== null) parts.push(`Floor ${c.floor_number}`);
  return parts.join(" · ") || "Neopolis";
}

function listingTitle(c: Classified): string {
  if (c.bedrooms) return `${c.bedrooms} BHK ${c.property_type.replace("_", " ")}`;
  return c.property_type.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase());
}

function daysAgo(iso: string): string {
  const d = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  if (d === 0) return "Today";
  if (d === 1) return "Yesterday";
  return `${d}d ago`;
}

export default function ClassifiedsPage() {
  const [listings,    setListings]    = useState<Classified[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [subTab,      setSubTab]      = useState<SubTab>("all");
  const [typeFilter,  setTypeFilter]  = useState<TypeFilter>("all");
  const [bhkFilter,   setBhkFilter]   = useState("all");

  useEffect(() => {
    const sb = createClient();
    sb.from("classifieds")
      .select("*, broker:brokers(name, company_name, rera_number)")
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setListings((data as Classified[]) ?? []);
        setLoadingData(false);
      });
  }, []);

  // Reset BHK filter when switching away from residential
  useEffect(() => {
    if (subTab !== "residential" && subTab !== "all") setBhkFilter("all");
  }, [subTab]);

  const filtered = listings.filter((l) => {
    if (subTab !== "all"        && l.sub_category  !== subTab)      return false;
    if (typeFilter !== "all"    && l.listing_type  !== typeFilter)   return false;
    if (bhkFilter !== "all"     && l.bedrooms      !== bhkFilter)    return false;
    return true;
  });

  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-brand-900 to-brand-800 text-white py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <span className="tag-blue mb-4 inline-block">Property Listings</span>
          <h1 className="text-3xl md:text-4xl font-extrabold mt-3 mb-3">
            Property Classifieds
          </h1>
          <p className="text-brand-200 text-base mb-6 max-w-xl">
            Residential, retail &amp; office listings in the Neopolis district — from verified
            owners and licensed brokers.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/auth/login?next=/dashboard/individual/post" className="btn-primary">
              <PlusCircle className="w-4 h-4" /> Post Your Property Free
            </Link>
            <Link
              href="/real-estate"
              className="btn-secondary border-brand-500 text-brand-300 hover:bg-brand-800"
            >
              Back to Real Estate
            </Link>
          </div>
        </div>
      </section>

      {/* Sub-category tabs */}
      <div className="bg-white border-b border-gray-200 sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-0">
            {(
              [
                ["all",         "All"],
                ["residential", "Residential"],
                ["retail",      "Retail"],
                ["office",      "Office Space"],
              ] as [SubTab, string][]
            ).map(([value, label]) => (
              <button
                key={value}
                onClick={() => setSubTab(value)}
                className={clsx(
                  "px-5 py-4 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap",
                  subTab === value
                    ? "border-brand-600 text-brand-700"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                )}
              >
                {label}
                {value !== "all" && (
                  <span className="ml-1.5 text-xs text-gray-400">
                    ({listings.filter((l) => l.sub_category === value).length})
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Filters row */}
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center gap-3">
          {/* Listing type */}
          <div className="flex rounded-lg border border-gray-200 overflow-hidden bg-white">
            {(
              [
                ["all",  "All"],
                ["sale", "For Sale"],
                ["rent", "For Rent"],
              ] as [TypeFilter, string][]
            ).map(([v, label]) => (
              <button
                key={v}
                onClick={() => setTypeFilter(v)}
                className={clsx(
                  "px-3 py-1.5 text-xs font-semibold transition-colors",
                  typeFilter === v
                    ? "bg-brand-600 text-white"
                    : "text-gray-600 hover:bg-gray-50"
                )}
              >
                {label}
              </button>
            ))}
          </div>

          {/* BHK filter — only meaningful for residential */}
          {(subTab === "residential" || subTab === "all") && (
            <div className="flex rounded-lg border border-gray-200 overflow-hidden bg-white">
              {["all", "1", "2", "3", "4"].map((b) => (
                <button
                  key={b}
                  onClick={() => setBhkFilter(b)}
                  className={clsx(
                    "px-3 py-1.5 text-xs font-semibold transition-colors",
                    bhkFilter === b
                      ? "bg-brand-600 text-white"
                      : "text-gray-600 hover:bg-gray-50"
                  )}
                >
                  {b === "all" ? "Any BHK" : `${b} BHK`}
                </button>
              ))}
            </div>
          )}

          <span className="ml-auto text-xs text-gray-400">
            {filtered.length} listing{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* Listing grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loadingData ? (
          <div className="text-center py-20 text-gray-400 text-sm">Loading listings…</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <Home className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p className="font-semibold text-gray-500">
              {listings.length === 0
                ? "No verified listings yet"
                : "No listings match your filters"}
            </p>
            {listings.length > 0 && (
              <button
                onClick={() => {
                  setSubTab("all");
                  setTypeFilter("all");
                  setBhkFilter("all");
                }}
                className="btn-secondary text-sm mt-4"
              >
                Clear filters
              </button>
            )}
            <div className="mt-6">
              <Link href="/dashboard/individual/post" className="btn-primary text-sm">
                <PlusCircle className="w-4 h-4" /> Post Your Property
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((l) => (
              <div key={l.id} className="card overflow-hidden flex flex-col">
                {/* Image placeholder */}
                <div className="h-44 bg-gradient-to-br from-brand-100 to-brand-200 flex items-center justify-center relative">
                  <Building2 className="w-12 h-12 text-brand-300" />
                  <span
                    className={clsx(
                      "absolute top-3 left-3 text-xs font-bold px-2 py-0.5 rounded-full",
                      l.listing_type === "rent"
                        ? "bg-green-100 text-green-800"
                        : "bg-blue-100 text-blue-800"
                    )}
                  >
                    For {l.listing_type === "rent" ? "Rent" : "Sale"}
                  </span>
                  <span className="absolute top-3 right-3 text-xs bg-white/80 text-gray-500 px-2 py-0.5 rounded-full">
                    {daysAgo(l.created_at)}
                  </span>
                  <span className="absolute bottom-3 left-3 text-xs font-semibold bg-white/90 text-gray-700 px-2 py-0.5 rounded-full capitalize">
                    {l.sub_category}
                  </span>
                </div>

                <div className="p-4 flex flex-col flex-1">
                  {/* Location */}
                  <div className="flex items-start gap-1.5 mb-1">
                    <MapPin className="w-3.5 h-3.5 text-brand-500 shrink-0 mt-0.5" />
                    <span className="text-xs text-brand-600 font-semibold leading-snug line-clamp-1">
                      {locationLabel(l)}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="font-bold text-gray-900 text-sm leading-snug mb-2 capitalize">
                    {listingTitle(l)}
                    {l.floor_number !== null && ` — Floor ${l.floor_number}`}
                  </h3>

                  {/* Specs */}
                  <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                    {l.bedrooms && (
                      <span className="flex items-center gap-1">
                        <Bed className="w-3.5 h-3.5" /> {l.bedrooms} Bed
                      </span>
                    )}
                    {l.carpet_area_sqft && (
                      <span className="flex items-center gap-1">
                        <Maximize2 className="w-3.5 h-3.5" /> {l.carpet_area_sqft.toLocaleString("en-IN")} sq ft
                      </span>
                    )}
                    {l.parking && l.parking !== "0" && (
                      <span className="flex items-center gap-1">
                        <Car className="w-3.5 h-3.5" /> {l.parking} P
                      </span>
                    )}
                  </div>

                  {/* Furnished + amenities */}
                  {l.furnished && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      <span className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded capitalize">
                        {l.furnished.replace(/-/g, " ")}
                      </span>
                      {l.amenities.slice(0, 2).map((a) => (
                        <span key={a} className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">
                          {a}
                        </span>
                      ))}
                      {l.amenities.length > 2 && (
                        <span className="text-xs text-gray-400">+{l.amenities.length - 2}</span>
                      )}
                    </div>
                  )}

                  {/* Description */}
                  {l.description && (
                    <p className="text-xs text-gray-500 line-clamp-2 mb-3">{l.description}</p>
                  )}

                  {/* Price + contact */}
                  <div className="mt-auto">
                    <p className="text-xl font-extrabold text-brand-700 mb-0.5">
                      ₹{l.price}{l.listing_type === "rent" ? "/mo" : ""}
                    </p>
                    {l.listing_type === "rent" && l.deposit && (
                      <p className="text-xs text-gray-400 mb-3">Deposit ₹{l.deposit}</p>
                    )}

                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <div className="flex items-center gap-2">
                        <div className={clsx(
                          "w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center shrink-0",
                          l.broker ? "bg-cyan-100 text-cyan-700" : "bg-brand-100 text-brand-700"
                        )}>
                          {l.owner_name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-gray-700">{l.owner_name}</p>
                          {l.broker ? (
                            <div className="flex items-center gap-1">
                              <BadgeCheck className="w-3 h-3 text-cyan-500" />
                              <p className="text-xs text-cyan-600 font-medium">
                                {l.broker.company_name ?? "Licensed Broker"}
                                {l.broker.rera_number ? ` · ${l.broker.rera_number}` : ""}
                              </p>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1">
                              <CheckCircle className="w-3 h-3 text-green-500" />
                              <p className="text-xs text-gray-400">Verified Owner</p>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {(l.contact_preference === "call" || l.contact_preference === "both") && (
                          <a
                            href={`tel:+91${l.contact_phone}`}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-gray-600 hover:border-brand-400 hover:text-brand-600 transition-colors"
                          >
                            <Phone className="w-3.5 h-3.5" /> Call
                          </a>
                        )}
                        {(l.contact_preference === "whatsapp" || l.contact_preference === "both") && (
                          <a
                            href={`https://wa.me/91${l.contact_phone}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-green-500 text-white text-xs font-semibold hover:bg-green-600 transition-colors"
                          >
                            <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Post CTA */}
        {!loadingData && (
          <div className="mt-12 rounded-2xl bg-brand-50 border border-brand-100 p-8 text-center">
            <Home className="w-10 h-10 text-brand-400 mx-auto mb-3" />
            <h3 className="font-bold text-gray-900 mb-1">Have a property to list?</h3>
            <p className="text-sm text-gray-500 mb-4">
              Post for free — no brokerage, direct contact with buyers &amp; tenants.
              Verified by our team before going live.
            </p>
            <Link href="/dashboard/individual/post" className="btn-primary text-sm">
              <PlusCircle className="w-4 h-4" /> Post Your Property
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
