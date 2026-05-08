"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Landmark, Wine, Trees,
  MapPin, Phone, Clock, CheckCircle, ArrowRight, CalendarDays,
} from "lucide-react";
import SectionWrapper from "@/components/SectionWrapper";
import LeadForm from "@/components/LeadForm";
import { getSubtypes } from "@/lib/businessDirectory";
import { createClient } from "@/lib/supabase/client";

type VenueType = "Convention Centre" | "Banquet Hall" | "Outdoor Space";

interface Business {
  id: string;
  name: string;
  subtypes: string[];
  address: string | null;
  contact_phone: string | null;
  description: string | null;
  timings: { day: string; open: string; close: string; closed: boolean }[] | null;
}

const TYPE_CONFIG: { id: VenueType; icon: React.ElementType; color: string; iconBg: string }[] = [
  { id: "Convention Centre", icon: Landmark, color: "bg-violet-50 text-violet-700", iconBg: "bg-violet-100" },
  { id: "Banquet Hall",      icon: Wine,     color: "bg-rose-50 text-rose-700",     iconBg: "bg-rose-100"   },
  { id: "Outdoor Space",     icon: Trees,    color: "bg-lime-50 text-lime-700",     iconBg: "bg-lime-100"   },
];
const TYPE_MAP = Object.fromEntries(TYPE_CONFIG.map((t) => [t.id, t]));

function formatTimings(timings: Business["timings"]): string {
  if (!timings || timings.length === 0) return "Hours not listed";
  const open = timings.filter((t) => !t.closed);
  if (open.length === 0) return "Temporarily closed";
  if (open.length === 7) return `Daily, ${open[0].open} – ${open[0].close}`;
  const days = open.map((t) => t.day.slice(0, 3)).join(", ");
  return `${days}, ${open[0].open} – ${open[0].close}`;
}

function SpaceCard({ b }: { b: Business }) {
  const subtype = (b.subtypes ?? []).find((s) => TYPE_MAP[s as VenueType]) as VenueType | undefined;
  const cfg = subtype ? TYPE_MAP[subtype] : TYPE_CONFIG[0];
  const Icon = cfg.icon;

  return (
    <div className="card p-5 space-y-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
      <div className="flex items-start justify-between">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${cfg.iconBg}`}>
          <Icon className={`w-6 h-6 ${cfg.color.split(" ")[1]}`} />
        </div>
        {subtype && (
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${cfg.color}`}>{subtype}</span>
        )}
      </div>

      <div>
        <h3 className="font-bold text-gray-900">{b.name}</h3>
        {b.address && (
          <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
            <MapPin className="w-3 h-3 shrink-0" /> {b.address}
          </p>
        )}
      </div>

      {b.description && (
        <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">{b.description}</p>
      )}

      <div className="space-y-1.5 text-xs text-gray-500">
        {b.contact_phone && (
          <p className="flex items-center gap-2">
            <Phone className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <a href={`tel:${b.contact_phone.replace(/\s/g, "")}`}
              className="font-medium text-violet-700 hover:text-violet-800 transition-colors">
              {b.contact_phone}
            </a>
          </p>
        )}
        {b.timings && (
          <p className="flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            {formatTimings(b.timings)}
          </p>
        )}
      </div>

      <div className="pt-1">
        <Link
          href={`/businesses/${b.id}`}
          className="text-xs font-semibold text-violet-600 hover:text-violet-700 flex items-center gap-1"
        >
          View Profile <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
}

function EventSpacesInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const subtypes = getSubtypes("Events", "Event Spaces");
  const subParam = searchParams.get("sub") ?? "all";

  const [subFilter, setSubFilter] = useState<string>(
    subtypes.includes(subParam) ? subParam : "all"
  );
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const s = searchParams.get("sub") ?? "all";
    setSubFilter(subtypes.includes(s) ? s : "all");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  useEffect(() => {
    async function fetch() {
      const supabase = createClient();
      const { data } = await supabase
        .from("businesses")
        .select("id, name, subtypes, address, contact_phone, description, timings")
        .eq("status", "active")
        .eq("industry", "Events")
        .contains("types", ["Event Spaces"])
        .order("name");
      setBusinesses(data ?? []);
      setLoading(false);
    }
    fetch();
  }, []);

  const handleFilter = (s: string) => {
    setSubFilter(s);
    router.replace(s === "all" ? "/events/spaces" : `/events/spaces?sub=${encodeURIComponent(s)}`, { scroll: false });
  };

  const filtered = subFilter === "all"
    ? businesses
    : businesses.filter((b) => b.subtypes?.includes(subFilter));

  return (
    <>
      {/* ── Hero ── */}
      <section className="bg-gradient-to-br from-violet-900 to-violet-700 text-white py-14 md:py-20">
        <SectionWrapper tight>
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-1.5 bg-violet-700 border border-violet-500 text-white text-xs font-bold px-3 py-1 rounded-full mb-4">
              <Landmark className="w-3.5 h-3.5" /> Event Spaces
            </span>
            <h1 className="text-3xl md:text-5xl font-extrabold mt-3 mb-4">
              Find the Perfect <span className="text-violet-300">Venue</span>
            </h1>
            <p className="text-violet-100 text-lg mb-6">
              Convention centres, banquet halls, and outdoor event grounds in the Neopolis district — all in one directory.
            </p>
            <div className="flex flex-wrap gap-2">
              {TYPE_CONFIG.map(({ id, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => handleFilter(id)}
                  className={`inline-flex items-center gap-2 font-semibold px-4 py-2.5 rounded-xl text-sm transition-colors ${
                    subFilter === id
                      ? "bg-white text-gray-900"
                      : "bg-violet-700 border border-violet-500 text-violet-100 hover:bg-violet-600"
                  }`}
                >
                  <Icon className="w-4 h-4" /> {id}
                </button>
              ))}
            </div>
          </div>
        </SectionWrapper>
      </section>

      {/* ── Capsule filters ── */}
      <section className="bg-white border-b border-gray-100 sticky top-[calc(4rem+28px)] z-30">
        <SectionWrapper tight>
          <div className="flex gap-2 overflow-x-auto py-3">
            <button
              onClick={() => handleFilter("all")}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap border transition-colors ${
                subFilter === "all"
                  ? "bg-violet-50 text-violet-700 border-violet-300"
                  : "border-gray-200 text-gray-500 hover:border-gray-400"
              }`}
            >
              All {!loading && <span className="ml-1 text-gray-400">({businesses.length})</span>}
            </button>
            {subtypes.map((st) => {
              const count = businesses.filter((b) => b.subtypes?.includes(st)).length;
              const cfg = TYPE_MAP[st as VenueType];
              return (
                <button
                  key={st}
                  onClick={() => handleFilter(st)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap border transition-colors ${
                    subFilter === st
                      ? `${cfg.color} border-current`
                      : "border-gray-200 text-gray-500 hover:border-gray-400"
                  }`}
                >
                  {st} {!loading && <span className="ml-1 opacity-60">({count})</span>}
                </button>
              );
            })}
          </div>
        </SectionWrapper>
      </section>

      {/* ── Venue grid ── */}
      <section className="bg-gray-50 min-h-64">
        <SectionWrapper>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="section-heading !mb-0">
                {subFilter === "all" ? "All Event Spaces" : `${subFilter}s`}
              </h2>
              <p className="text-sm text-gray-500 mt-0.5">
                {loading ? "Loading…" : `${filtered.length} venue${filtered.length !== 1 ? "s" : ""} in Neopolis`}
              </p>
            </div>
            <Link href="/events" className="text-violet-600 text-sm font-semibold flex items-center gap-1 hover:text-violet-700">
              Upcoming Events <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[1, 2, 3].map((i) => (
                <div key={i} className="card p-5 h-64 animate-pulse bg-gray-100" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <Landmark className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No event spaces listed yet</p>
              <p className="text-sm mt-1">Be the first to register your venue below.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map((b) => <SpaceCard key={b.id} b={b} />)}
            </div>
          )}
        </SectionWrapper>
      </section>

      {/* ── CTA ── */}
      <section className="bg-violet-900 text-white">
        <SectionWrapper>
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
                List Your Event Space
              </h2>
              <p className="text-violet-200 mb-5">
                Get your venue in front of event planners, corporates, and residents actively searching for spaces in Neopolis.
              </p>
              <ul className="space-y-2 text-sm text-violet-100">
                {[
                  "Capacity, amenities & hours shown clearly",
                  "Photo gallery & floor plan upload",
                  "Direct enquiry calls to your number",
                  "Linked to Upcoming Events listings",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-violet-400 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <div className="flex gap-3 mt-6">
                <Link
                  href="/auth/register"
                  className="inline-flex items-center gap-2 bg-white text-violet-700 font-bold px-6 py-3 rounded-xl text-sm hover:bg-violet-50 transition-colors"
                >
                  Register Your Venue <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/events"
                  className="inline-flex items-center gap-2 bg-violet-700 border border-violet-500 text-white font-semibold px-5 py-3 rounded-xl text-sm hover:bg-violet-600 transition-colors"
                >
                  <CalendarDays className="w-4 h-4" /> View Events
                </Link>
              </div>
            </div>
            <div className="bg-violet-800 rounded-2xl border border-violet-600 p-6">
              <LeadForm
                title="Register Your Event Space"
                subtitle="We'll set up your venue listing with capacity, amenities, and booking contact."
                purpose="event-space"
                dark
              />
            </div>
          </div>
        </SectionWrapper>
      </section>
    </>
  );
}

export default function EventSpacesPage() {
  return (
    <Suspense>
      <EventSpacesInner />
    </Suspense>
  );
}
