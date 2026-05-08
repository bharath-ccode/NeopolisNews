"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  CalendarDays, Music, Trophy, Utensils, Palette, Package,
  MapPin, Clock, ArrowRight, CheckCircle, Loader2,
} from "lucide-react";
import SectionWrapper from "@/components/SectionWrapper";
import { createClient } from "@/lib/supabase/client";

export const dynamic = "force-dynamic";

type EventType = "all" | "music_concert" | "sports_run" | "food_festival" | "culture_art" | "exhibition";

const CATEGORIES: { id: EventType; label: string; Icon: React.ComponentType<{ className?: string }>; color: string; bg: string }[] = [
  { id: "all",           label: "All Events",     Icon: CalendarDays, color: "text-violet-600", bg: "bg-violet-50"  },
  { id: "music_concert", label: "Music Concerts", Icon: Music,        color: "text-purple-600", bg: "bg-purple-50"  },
  { id: "sports_run",    label: "Sports & Runs",  Icon: Trophy,       color: "text-orange-600", bg: "bg-orange-50"  },
  { id: "food_festival", label: "Food Festivals", Icon: Utensils,     color: "text-yellow-700", bg: "bg-yellow-50"  },
  { id: "culture_art",   label: "Culture & Art",  Icon: Palette,      color: "text-rose-600",   bg: "bg-rose-50"    },
  { id: "exhibition",    label: "Exhibitions",    Icon: Package,      color: "text-teal-600",   bg: "bg-teal-50"    },
];

const CAT_MAP = Object.fromEntries(CATEGORIES.map((c) => [c.id, c]));

interface BusinessEvent {
  id: string;
  name: string;
  event_type: string;
  event_date: string;
  start_time: string;
  end_time: string;
  description: string | null;
  image_url: string | null;
  business_id: string;
  businesses: { name: string; address: string | null } | null;
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
}

function EventCard({ ev, featured }: { ev: BusinessEvent; featured?: boolean }) {
  const cat = CAT_MAP[ev.event_type as EventType] ?? CAT_MAP["exhibition"];
  const Icon = cat.Icon;
  return (
    <div className={`card p-5 space-y-3 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 ${featured ? "ring-2 ring-violet-200" : ""}`}>
      {featured && (
        <span className="inline-block text-xs font-bold bg-violet-600 text-white px-2.5 py-0.5 rounded-full">Featured</span>
      )}
      {ev.image_url && (
        <div className="w-full h-36 rounded-xl overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={ev.image_url} alt={ev.name} className="w-full h-full object-cover" />
        </div>
      )}
      <div className="flex items-start justify-between gap-2">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${cat.bg}`}>
          <Icon className={`w-5 h-5 ${cat.color}`} />
        </div>
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${cat.bg} ${cat.color}`}>{cat.label}</span>
      </div>
      <div>
        <h3 className="font-bold text-gray-900 leading-snug">{ev.name}</h3>
        {ev.businesses?.name && (
          <p className="text-xs text-brand-600 font-medium mt-0.5">by {ev.businesses.name}</p>
        )}
      </div>
      {ev.description && <p className="text-sm text-gray-600 line-clamp-2">{ev.description}</p>}
      <div className="space-y-1 text-xs text-gray-500">
        <p className="flex items-center gap-1.5"><CalendarDays className="w-3.5 h-3.5 text-gray-400" />{formatDate(ev.event_date)}</p>
        <p className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-gray-400" />{ev.start_time.slice(0, 5)} – {ev.end_time.slice(0, 5)}</p>
        {ev.businesses?.address && (
          <p className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-gray-400" />{ev.businesses.address}</p>
        )}
      </div>
      <Link href={`/events/${ev.id}`}
        className="inline-flex items-center gap-1 text-xs font-semibold text-violet-600 hover:text-violet-700">
        View Details <ArrowRight className="w-3 h-3" />
      </Link>
    </div>
  );
}

export default function EventsPage() {
  const [filter, setFilter] = useState<EventType>("all");
  const [events, setEvents] = useState<BusinessEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const q = supabase
        .from("business_events")
        .select("*, businesses(name, address)")
        .eq("status", "active")
        .gte("event_date", new Date().toISOString().slice(0, 10))
        .order("event_date", { ascending: true });
      const { data } = await q;
      setEvents((data ?? []) as BusinessEvent[]);
      setLoading(false);
    }
    load();
  }, []);

  const filtered = filter === "all" ? events : events.filter((e) => e.event_type === filter);
  const featured = filtered.slice(0, 2);
  const rest = filtered.slice(2);

  return (
    <>
      {/* ── Hero ── */}
      <section className="bg-gradient-to-br from-violet-900 to-violet-700 text-white py-14 md:py-20">
        <SectionWrapper tight>
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-1.5 bg-violet-700 border border-violet-500 text-white text-xs font-bold px-3 py-1 rounded-full mb-4">
              <CalendarDays className="w-3.5 h-3.5" /> What&apos;s On in Neopolis
            </span>
            <h1 className="text-3xl md:text-5xl font-extrabold mt-3 mb-4">
              Upcoming <span className="text-violet-300">Events</span>
            </h1>
            <p className="text-violet-100 text-lg">
              Concerts, exhibitions, food festivals, sports events, and more —
              hosted by businesses right here in the district.
            </p>
          </div>
        </SectionWrapper>
      </section>

      {/* ── Category filter bar ── */}
      <section className="bg-white border-b border-gray-100 sticky top-[calc(4rem+28px)] z-30">
        <SectionWrapper tight>
          <div className="flex gap-2 overflow-x-auto py-3 scrollbar-none">
            {CATEGORIES.map(({ id, label, Icon, color, bg }) => (
              <button
                key={id}
                onClick={() => setFilter(id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-semibold whitespace-nowrap transition-all shrink-0 ${
                  filter === id
                    ? `${bg} ${color} border-current`
                    : "border-gray-200 text-gray-500 hover:border-gray-400"
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
                {!loading && (
                  <span className="opacity-60 text-xs">
                    ({filter === id || id === "all"
                      ? id === "all" ? events.length : filtered.length
                      : events.filter((e) => e.event_type === id).length})
                  </span>
                )}
              </button>
            ))}
          </div>
        </SectionWrapper>
      </section>

      {/* ── Events grid ── */}
      <SectionWrapper>
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-7 h-7 animate-spin text-violet-500" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <CalendarDays className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="font-medium text-gray-500">No upcoming events in this category</p>
            <p className="text-sm mt-1">Check back soon or browse another category.</p>
          </div>
        ) : (
          <>
            {featured.length > 0 && (
              <>
                <h2 className="section-heading mb-5">Coming Up</h2>
                <div className="grid sm:grid-cols-2 gap-5 mb-10">
                  {featured.map((ev) => <EventCard key={ev.id} ev={ev} featured />)}
                </div>
              </>
            )}
            {rest.length > 0 && (
              <>
                <h2 className="section-heading mb-5">More Events</h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {rest.map((ev) => <EventCard key={ev.id} ev={ev} />)}
                </div>
              </>
            )}
          </>
        )}
      </SectionWrapper>

      {/* ── CTA ── */}
      <section className="bg-violet-900 text-white py-14">
        <SectionWrapper tight>
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="max-w-xl">
              <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-3">
                Hosting an Event?
              </h2>
              <p className="text-violet-200 mb-5">
                Any business in the Neopolis directory can post events — concerts,
                exhibitions, food festivals, runs, and more.
              </p>
              <ul className="space-y-2 text-sm text-violet-100">
                {[
                  "Appears on the public Events page instantly",
                  "Shown on your business profile",
                  "Filtered by event type",
                  "Free for all listed businesses",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-violet-400 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <Link
              href="/my-business"
              className="inline-flex items-center justify-center gap-2 bg-white text-violet-700 font-bold px-8 py-3.5 rounded-xl text-sm hover:bg-violet-50 transition-colors shrink-0"
            >
              Post an Event <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </SectionWrapper>
      </section>
    </>
  );
}
