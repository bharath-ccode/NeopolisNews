"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Car, Bike, Sofa, Tv, Zap, Tag, Phone, MessageCircle,
  PlusCircle, Search, Clock,
} from "lucide-react";
import clsx from "clsx";
import { createClient } from "@/lib/supabase/client";

interface Ad {
  id: string;
  owner_name: string;
  contact_phone: string;
  contact_preference: string;
  category: string;
  title: string;
  description: string;
  price: string | null;
  photos: string[];
  duration_days: number;
  expires_at: string | null;
  created_at: string;
}

const CATEGORIES = [
  { value: "all",         label: "All",             icon: Tag   },
  { value: "cars",        label: "Cars & Vehicles", icon: Car   },
  { value: "bikes",       label: "Bikes & Scooters",icon: Bike  },
  { value: "furniture",   label: "Furniture",       icon: Sofa  },
  { value: "electronics", label: "Electronics",     icon: Tv    },
  { value: "appliances",  label: "Appliances",      icon: Zap   },
  { value: "others",      label: "Others",          icon: Tag   },
];

function daysLeft(expiresAt: string | null): string {
  if (!expiresAt) return "";
  const d = Math.max(0, Math.ceil((new Date(expiresAt).getTime() - Date.now()) / 86400000));
  if (d === 0) return "Expires today";
  if (d === 1) return "1 day left";
  return `${d} days left`;
}

function timeAgo(iso: string): string {
  const d = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  if (d === 0) return "Today";
  if (d === 1) return "Yesterday";
  return `${d}d ago`;
}

export default function ClassifiedsPage() {
  const [ads,         setAds]         = useState<Ad[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [category,    setCategory]    = useState("all");
  const [search,      setSearch]      = useState("");

  useEffect(() => {
    const sb = createClient();
    sb.from("ads")
      .select("*")
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        // Filter out expired ads client-side as well
        const now = Date.now();
        const live = (data as Ad[] ?? []).filter(
          (a) => !a.expires_at || new Date(a.expires_at).getTime() > now
        );
        setAds(live);
        setLoadingData(false);
      });
  }, []);

  const q = search.toLowerCase();
  const filtered = ads.filter((a) => {
    if (category !== "all" && a.category !== category) return false;
    if (q && ![a.title, a.description, a.owner_name].join(" ").toLowerCase().includes(q)) return false;
    return true;
  });

  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-gray-900 to-gray-800 text-white py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-white/10 text-gray-300 border border-white/20 px-2.5 py-1 rounded-full mb-4">
            <Tag className="w-3 h-3" /> Classifieds
          </span>
          <h1 className="text-3xl md:text-4xl font-extrabold mt-2 mb-3">
            Buy &amp; Sell in Neopolis
          </h1>
          <p className="text-gray-300 text-base mb-6 max-w-xl">
            Cars, bikes, furniture, electronics and more — directly from your neighbours.
            No middlemen.
          </p>
          <Link href="/dashboard/individual/classifieds" className="btn-primary">
            <PlusCircle className="w-4 h-4" /> Post a Free Ad
          </Link>
        </div>
      </section>

      {/* Category pills */}
      <div className="bg-white border-b border-gray-200 sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-2 overflow-x-auto scrollbar-none">
          {CATEGORIES.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              onClick={() => setCategory(value)}
              className={clsx(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold whitespace-nowrap transition-colors shrink-0",
                category === value
                  ? "bg-brand-600 text-white border-brand-600"
                  : "border-gray-200 text-gray-600 hover:border-gray-300"
              )}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
              {value !== "all" && (
                <span className={clsx("text-xs", category === value ? "text-brand-200" : "text-gray-400")}>
                  ({ads.filter((a) => a.category === value).length})
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Search + results */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Search bar */}
        <div className="relative mb-6 max-w-lg">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search ads…"
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        {loadingData ? (
          <div className="text-center py-20 text-gray-400 text-sm">Loading ads…</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <Tag className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p className="font-semibold text-gray-500">
              {ads.length === 0 ? "No ads yet — be the first!" : "No ads match your search"}
            </p>
            {search && (
              <button onClick={() => setSearch("")} className="btn-secondary text-sm mt-4">
                Clear search
              </button>
            )}
            <div className="mt-6">
              <Link href="/dashboard/individual/classifieds" className="btn-primary text-sm">
                <PlusCircle className="w-4 h-4" /> Post Your Ad
              </Link>
            </div>
          </div>
        ) : (
          <>
            <p className="text-xs text-gray-400 mb-4">
              {filtered.length} ad{filtered.length !== 1 ? "s" : ""}
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filtered.map((ad) => (
                <div key={ad.id} className="card flex flex-col overflow-hidden">
                  {/* Photo */}
                  <div className="h-40 bg-gray-100 relative overflow-hidden flex items-center justify-center">
                    {ad.photos.length > 0 ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={ad.photos[0]}
                        alt={ad.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      (() => {
                        const Cat = CATEGORIES.find((c) => c.value === ad.category)?.icon ?? Tag;
                        return <Cat className="w-12 h-12 text-gray-300" />;
                      })()
                    )}
                    <span className="absolute top-2 left-2 text-xs font-semibold bg-white/90 text-gray-700 px-2 py-0.5 rounded-full capitalize">
                      {CATEGORIES.find((c) => c.value === ad.category)?.label ?? ad.category}
                    </span>
                    <span className="absolute top-2 right-2 text-xs text-gray-500 bg-white/80 px-2 py-0.5 rounded-full">
                      {timeAgo(ad.created_at)}
                    </span>
                  </div>

                  <div className="p-4 flex flex-col flex-1">
                    <h3 className="font-bold text-sm text-gray-900 leading-snug mb-1 line-clamp-2">
                      {ad.title}
                    </h3>
                    <p className="text-xs text-gray-500 line-clamp-2 mb-3 flex-1">
                      {ad.description}
                    </p>

                    {/* Price */}
                    {ad.price ? (
                      <p className="text-lg font-extrabold text-brand-700 mb-2">₹{ad.price}</p>
                    ) : (
                      <p className="text-sm font-semibold text-gray-400 italic mb-2">Price on request</p>
                    )}

                    {/* Expiry */}
                    {ad.expires_at && (
                      <p className="flex items-center gap-1 text-xs text-gray-400 mb-3">
                        <Clock className="w-3 h-3" />
                        {daysLeft(ad.expires_at)}
                      </p>
                    )}

                    {/* Contact */}
                    <div className="flex gap-2 pt-3 border-t border-gray-100">
                      {(ad.contact_preference === "call" || ad.contact_preference === "both") && (
                        <a
                          href={`tel:+91${ad.contact_phone}`}
                          className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg border border-gray-200 text-xs font-semibold text-gray-600 hover:border-brand-400 hover:text-brand-600 transition-colors"
                        >
                          <Phone className="w-3.5 h-3.5" /> Call
                        </a>
                      )}
                      {(ad.contact_preference === "whatsapp" || ad.contact_preference === "both") && (
                        <a
                          href={`https://wa.me/91${ad.contact_phone}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg bg-green-500 text-white text-xs font-semibold hover:bg-green-600 transition-colors"
                        >
                          <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Post CTA */}
        {!loadingData && (
          <div className="mt-12 rounded-2xl bg-gray-50 border border-gray-200 p-8 text-center">
            <Tag className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <h3 className="font-bold text-gray-900 mb-1">Something to sell?</h3>
            <p className="text-sm text-gray-500 mb-4">
              Post your ad free — car, bike, furniture, electronics. Reviewed &amp; live within 24 hours.
            </p>
            <Link href="/dashboard/individual/classifieds" className="btn-primary text-sm">
              <PlusCircle className="w-4 h-4" /> Post a Free Ad
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
