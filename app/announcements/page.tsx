"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Bell, ShieldCheck, Building2,
  Rocket, Sparkles, UserPlus, AlertCircle, Heart,
} from "lucide-react";

interface BusinessSnippet {
  id: string;
  name: string;
  logo: string | null;
  industry: string;
  verified: boolean;
  address: string;
}

interface Update {
  id: string;
  type: string;
  title: string;
  body: string;
  image_url: string | null;
  cta_label: string | null;
  cta_url: string | null;
  created_at: string;
  businesses: BusinessSnippet | null;
}

const TYPE_META: Record<string, { label: string; icon: React.ElementType; color: string; bg: string }> = {
  opening:     { label: "Grand Opening",  icon: Rocket,      color: "text-green-700",  bg: "bg-green-50 border-green-200"    },
  new_arrival: { label: "New Arrival",    icon: Sparkles,    color: "text-blue-700",   bg: "bg-blue-50 border-blue-200"      },
  hiring:      { label: "We're Hiring",   icon: UserPlus,    color: "text-purple-700", bg: "bg-purple-50 border-purple-200"  },
  notice:      { label: "Notice",         icon: AlertCircle, color: "text-amber-700",  bg: "bg-amber-50 border-amber-200"    },
  community:   { label: "Community",      icon: Heart,       color: "text-pink-700",   bg: "bg-pink-50 border-pink-200"      },
};

const FILTERS = [
  { value: "",            label: "All" },
  { value: "opening",     label: "Openings" },
  { value: "new_arrival", label: "New Arrivals" },
  { value: "hiring",      label: "Hiring" },
  { value: "notice",      label: "Notices" },
  { value: "community",   label: "Community" },
];

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

export default function AnnouncementsPage() {
  const [updates, setUpdates] = useState<Update[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    setLoading(true);
    const params = filter ? `?type=${filter}` : "";
    fetch(`/api/announcements${params}`)
      .then((r) => r.json())
      .then((data) => { setUpdates(Array.isArray(data) ? data : []); setLoading(false); });
  }, [filter]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-brand-900 to-brand-700 text-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 md:py-16">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center">
              <Bell className="w-5 h-5" />
            </div>
            <span className="text-brand-300 text-sm font-semibold uppercase tracking-widest">
              Announcements
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold mb-3">
            What&apos;s New in Neopolis
          </h1>
          <p className="text-brand-200 text-base max-w-xl">
            New openings, fresh arrivals, job opportunities, and community news — straight from local businesses.
          </p>
        </div>
      </section>

      {/* Filter bar */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-3 flex gap-2 overflow-x-auto scrollbar-hide">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${
                filter === f.value
                  ? "bg-brand-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Feed */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-4">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card p-5 animate-pulse">
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gray-200 shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-gray-200 rounded w-1/4" />
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-100 rounded w-full" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : updates.length === 0 ? (
          <div className="text-center py-20">
            <Bell className="w-12 h-12 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">No announcements yet</p>
            <p className="text-sm text-gray-400 mt-1">
              Businesses post updates here when something&apos;s new.
            </p>
            <Link
              href="/my-business"
              className="inline-flex items-center gap-2 mt-6 text-sm font-semibold text-brand-600 hover:text-brand-700"
            >
              <Bell className="w-4 h-4" /> Own a business? Post an announcement
            </Link>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-400">{updates.length} announcement{updates.length !== 1 ? "s" : ""}</p>
            {updates.map((u) => {
              const meta = TYPE_META[u.type] ?? TYPE_META.notice;
              const Icon = meta.icon;
              const biz = u.businesses;
              return (
                <div key={u.id} className="card overflow-hidden">
                  {u.image_url && (
                    <div className="h-48 overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={u.image_url}
                        alt={u.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="p-5">
                    {/* Type badge + time */}
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full border ${meta.bg} ${meta.color}`}>
                        <Icon className="w-3 h-3" /> {meta.label}
                      </span>
                      <span className="text-xs text-gray-400">{timeAgo(u.created_at)}</span>
                    </div>

                    <h2 className="font-extrabold text-gray-900 text-base mb-1">{u.title}</h2>
                    <p className="text-sm text-gray-600 leading-relaxed">{u.body}</p>

                    {u.cta_label && u.cta_url && (
                      <a
                        href={u.cta_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 mt-3 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
                      >
                        {u.cta_label}
                      </a>
                    )}

                    {/* Business info */}
                    {biz && (
                      <Link
                        href={`/businesses/${biz.id}`}
                        className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-100 group"
                      >
                        <div className="w-9 h-9 rounded-xl bg-gray-100 overflow-hidden flex items-center justify-center shrink-0">
                          {biz.logo ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={biz.logo} alt={biz.name} className="w-full h-full object-cover" />
                          ) : (
                            <Building2 className="w-4 h-4 text-gray-400" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1">
                            <p className="text-sm font-semibold text-gray-800 group-hover:text-brand-700 transition-colors truncate">
                              {biz.name}
                            </p>
                            {biz.verified && (
                              <ShieldCheck className="w-3.5 h-3.5 text-green-500 shrink-0" />
                            )}
                          </div>
                          <p className="text-xs text-gray-400 truncate">{biz.address}</p>
                        </div>
                        <span className="text-xs text-brand-600 font-semibold group-hover:underline shrink-0">
                          View profile →
                        </span>
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </>
        )}

        {/* CTA */}
        <div className="bg-white border border-brand-100 rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-4 mt-4">
          <div className="flex-1">
            <p className="font-bold text-gray-900">Have news to share?</p>
            <p className="text-sm text-gray-500 mt-0.5">
              Grand opening, new arrivals, hiring, or community events — post it here and reach Neopolis residents instantly.
            </p>
          </div>
          <Link
            href="/my-business"
            className="shrink-0 bg-brand-600 hover:bg-brand-700 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors"
          >
            Post Announcement
          </Link>
        </div>
      </div>
    </div>
  );
}
