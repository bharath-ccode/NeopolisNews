"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Tag, ShieldCheck, Building2, Clock, Sparkles } from "lucide-react";

interface BusinessSnippet {
  id: string;
  name: string;
  logo: string | null;
  industry: string;
  verified: boolean;
  address: string;
}

interface Offer {
  id: string;
  name: string;
  description: string | null;
  discount_percent: number | null;
  discount_label: string | null;
  start_date: string;
  end_date: string;
  image_url: string | null;
  business_id: string;
  businesses: BusinessSnippet | null;
}

function discountBadge(offer: Offer): string {
  if (offer.discount_percent) return `${offer.discount_percent}% OFF`;
  if (offer.discount_label) return offer.discount_label;
  return "Special Offer";
}

function daysLeft(endDate: string): number {
  const end = new Date(endDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

function urgencyColor(days: number): string {
  if (days <= 2) return "bg-red-600 text-white";
  if (days <= 7) return "bg-orange-500 text-white";
  return "bg-brand-600 text-white";
}

const INDUSTRIES = [
  "All",
  "Food & Beverage",
  "Health & Wellness",
  "Retail",
  "Education",
  "Entertainment",
  "Services",
];

export default function DealsPage() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    fetch("/api/deals")
      .then((r) => r.json())
      .then((data) => {
        setOffers(Array.isArray(data) ? data : []);
        setLoading(false);
      });
  }, []);

  const industries = [
    "All",
    ...Array.from(
      new Set(offers.map((o) => o.businesses?.industry).filter((x): x is string => !!x))
    ).sort(),
  ];

  const filtered =
    filter === "All"
      ? offers
      : offers.filter((o) => o.businesses?.industry === filter);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-orange-600 to-brand-700 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 md:py-16">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="text-orange-200 text-sm font-semibold uppercase tracking-widest">
              Local Deals
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold mb-3">
            Today&apos;s Offers from Your Neighbourhood
          </h1>
          <p className="text-orange-100 text-base max-w-xl">
            Exclusive deals from verified local businesses — restaurants, gyms, salons, retailers and more. No flyers, no clutter.
          </p>
        </div>
      </section>

      {/* Filter bar */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex gap-2 overflow-x-auto scrollbar-hide">
          {industries.map((ind) => (
            <button
              key={ind}
              onClick={() => setFilter(ind)}
              className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${
                filter === ind
                  ? "bg-brand-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {ind}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="card overflow-hidden animate-pulse">
                <div className="h-44 bg-gray-200" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-2/3" />
                  <div className="h-3 bg-gray-100 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <Tag className="w-12 h-12 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">No active deals right now</p>
            <p className="text-sm text-gray-400 mt-1">
              Businesses post deals here — check back soon.
            </p>
            <Link
              href="/my-business"
              className="inline-flex items-center gap-2 mt-6 text-sm font-semibold text-brand-600 hover:text-brand-700"
            >
              <Tag className="w-4 h-4" /> Own a business? Post a deal
            </Link>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-400 mb-5">
              {filtered.length} active deal{filtered.length !== 1 ? "s" : ""}
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map((offer) => {
                const biz = offer.businesses;
                const days = daysLeft(offer.end_date);
                const badge = discountBadge(offer);
                return (
                  <Link
                    key={offer.id}
                    href={biz ? `/businesses/${biz.id}` : "#"}
                    className="card overflow-hidden group hover:shadow-md transition-shadow"
                  >
                    {/* Image */}
                    <div className="relative h-44 bg-gray-100 overflow-hidden">
                      {offer.image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={offer.image_url}
                          alt={offer.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-50 to-brand-50">
                          <Tag className="w-12 h-12 text-orange-200" />
                        </div>
                      )}
                      {/* Discount badge */}
                      <div className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-extrabold shadow ${urgencyColor(days)}`}>
                        {badge}
                      </div>
                      {/* Urgency */}
                      {days <= 7 && (
                        <div className={`absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-bold ${urgencyColor(days)}`}>
                          <Clock className="w-3 h-3" />
                          {days <= 0 ? "Ends today" : `${days}d left`}
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="p-4">
                      <h3 className="font-bold text-gray-900 text-sm leading-snug mb-1 group-hover:text-brand-700 transition-colors">
                        {offer.name}
                      </h3>
                      {offer.description && (
                        <p className="text-xs text-gray-500 line-clamp-2 mb-2">
                          {offer.description}
                        </p>
                      )}

                      {/* Business info */}
                      {biz && (
                        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
                          <div className="w-8 h-8 rounded-lg bg-gray-100 overflow-hidden flex items-center justify-center shrink-0">
                            {biz.logo ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={biz.logo}
                                alt={biz.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Building2 className="w-4 h-4 text-gray-400" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1">
                              <p className="text-xs font-semibold text-gray-800 truncate">
                                {biz.name}
                              </p>
                              {biz.verified && (
                                <ShieldCheck className="w-3 h-3 text-green-500 shrink-0" />
                              )}
                            </div>
                            <p className="text-[11px] text-gray-400 truncate">
                              {biz.industry}
                            </p>
                          </div>
                          <p className="text-[11px] text-gray-400 shrink-0 whitespace-nowrap">
                            Until {new Date(offer.end_date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                          </p>
                        </div>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </>
        )}

        {/* CTA for businesses */}
        <div className="mt-12 bg-white border border-orange-100 rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-4">
          <div className="flex-1">
            <p className="font-bold text-gray-900">Own a local business?</p>
            <p className="text-sm text-gray-500 mt-0.5">
              Post your deals here for free and reach thousands of Neopolis residents — no printing, no distribution.
            </p>
          </div>
          <Link
            href="/my-business"
            className="shrink-0 bg-orange-600 hover:bg-orange-700 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors"
          >
            Post a Deal
          </Link>
        </div>
      </div>
    </div>
  );
}
