"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Landmark, Wine, Trees,
  Users, MapPin, Phone, Clock, CheckCircle, ArrowRight, CalendarDays, Star,
} from "lucide-react";
import SectionWrapper from "@/components/SectionWrapper";
import LeadForm from "@/components/LeadForm";
import { getSubtypes } from "@/lib/businessDirectory";

type VenueType = "Convention Centre" | "Banquet Hall" | "Outdoor Space";

interface Space {
  type: VenueType;
  name: string;
  location: string;
  phone: string;
  capacity: string;
  area: string;
  hours: string;
  rating: number;
  reviews: number;
  amenities: string[];
  description: string;
}

const TYPE_CONFIG: { id: VenueType; icon: React.ElementType; color: string; iconBg: string }[] = [
  { id: "Convention Centre", icon: Landmark, color: "bg-violet-50 text-violet-700", iconBg: "bg-violet-100" },
  { id: "Banquet Hall",      icon: Wine,     color: "bg-rose-50 text-rose-700",     iconBg: "bg-rose-100"   },
  { id: "Outdoor Space",     icon: Trees,    color: "bg-lime-50 text-lime-700",     iconBg: "bg-lime-100"   },
];
const TYPE_MAP = Object.fromEntries(TYPE_CONFIG.map((t) => [t.id, t]));

const SPACES: Space[] = [
  {
    type: "Convention Centre",
    name: "Neopolis Convention & Exhibition Centre",
    location: "Block A, Commercial Zone",
    phone: "+91 99002 00001",
    capacity: "up to 2,000",
    area: "8,500 sq ft (divisible)",
    hours: "Available 24 / 7 (booking required)",
    rating: 4.7, reviews: 84,
    amenities: ["AV & Stage Setup", "Catering Kitchen", "Green Room", "Ample Parking", "High-Speed Wi-Fi", "Breakout Halls"],
    description: "Neopolis's largest event venue — divisible into three halls. Ideal for corporate conferences, exhibitions, product launches, and large-scale gatherings.",
  },
  {
    type: "Banquet Hall",
    name: "The Grand Ballroom — Neopolis",
    location: "Tower 5, Hospitality Block",
    phone: "+91 99002 00011",
    capacity: "up to 600",
    area: "3,200 sq ft",
    hours: "Mon – Sun, 10 AM – 12 AM",
    rating: 4.8, reviews: 136,
    amenities: ["In-house Catering", "Décor & Floral", "Dance Floor", "Stage & DJ Console", "Valet Parking", "Bridal Suite"],
    description: "An elegant ballroom for weddings, receptions, milestone celebrations, and gala dinners. Full catering and décor packages available.",
  },
  {
    type: "Outdoor Space",
    name: "Central Park Amphitheatre",
    location: "Central Park, District Core",
    phone: "+91 99002 00021",
    capacity: "up to 3,000 (standing) / 1,500 (seated)",
    area: "Open-air, 12,000 sq ft",
    hours: "Available 7 AM – 11 PM",
    rating: 4.6, reviews: 52,
    amenities: ["Professional Stage", "Sound & Lighting Rig", "Backstage Area", "Food Vendor Zones", "Accessible Pathways"],
    description: "A naturally landscaped open-air amphitheatre — the go-to venue for music festivals, community days, marathons, and outdoor film screenings.",
  },
  {
    type: "Convention Centre",
    name: "Apex Business Conference Hub",
    location: "Tower 3, Business Park",
    phone: "+91 99002 00031",
    capacity: "up to 400",
    area: "2,400 sq ft (3 meeting rooms)",
    hours: "Mon – Sat, 8 AM – 10 PM",
    rating: 4.5, reviews: 61,
    amenities: ["Video Conferencing", "AV Equipment", "Catering Service", "Dedicated Reception", "Underground Parking"],
    description: "Three configurable meeting and seminar rooms ideal for corporate training, AGMs, seminars, and investor presentations.",
  },
  {
    type: "Banquet Hall",
    name: "Neopolis Terrace Banquets",
    location: "Rooftop, Commercial Block C",
    phone: "+91 99002 00041",
    capacity: "up to 250",
    area: "1,800 sq ft open terrace",
    hours: "Mon – Sun, 12 PM – 12 AM",
    rating: 4.4, reviews: 47,
    amenities: ["Skyline View", "Open Bar Setup", "Live Counter Catering", "Photobooth Corner", "Ample Parking"],
    description: "A rooftop venue with panoramic views of the Neopolis skyline. Perfect for intimate weddings, cocktail parties, and milestone dinners.",
  },
  {
    type: "Outdoor Space",
    name: "East Lawn & Events Ground",
    location: "East Precinct, Neopolis",
    phone: "+91 99002 00051",
    capacity: "up to 5,000",
    area: "2.5 acres open ground",
    hours: "Available 6 AM – 10 PM",
    rating: 4.3, reviews: 29,
    amenities: ["Flexible Layout", "Power & Water Points", "Food Court Area", "Security Fencing Available", "Ample Parking"],
    description: "The largest open ground in the district — suited for large fairs, car shows, sporting events, and community festivals.",
  },
];

function SpaceCard({ s }: { s: Space }) {
  const cfg = TYPE_MAP[s.type];
  const Icon = cfg.icon;
  return (
    <div className="card p-5 space-y-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
      <div className="flex items-start justify-between">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${cfg.iconBg}`}>
          <Icon className={`w-6 h-6 ${cfg.color.split(" ")[1]}`} />
        </div>
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${cfg.color}`}>{s.type}</span>
      </div>
      <div>
        <h3 className="font-bold text-gray-900">{s.name}</h3>
        <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
          <MapPin className="w-3 h-3" /> {s.location}
        </p>
      </div>
      <p className="text-sm text-gray-600 leading-relaxed">{s.description}</p>
      <div className="space-y-1.5 text-xs text-gray-500">
        <p className="flex items-center gap-2"><Users className="w-3.5 h-3.5 text-gray-400" /> {s.capacity}</p>
        <p className="flex items-center gap-2"><Landmark className="w-3.5 h-3.5 text-gray-400" /> {s.area}</p>
        <p className="flex items-center gap-2"><Clock className="w-3.5 h-3.5 text-gray-400" /> {s.hours}</p>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {s.amenities.slice(0, 4).map((a) => (
          <span key={a} className="text-xs bg-gray-50 border border-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{a}</span>
        ))}
        {s.amenities.length > 4 && (
          <span className="text-xs text-gray-400">+{s.amenities.length - 4} more</span>
        )}
      </div>
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-1">
          <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
          <span className="text-xs font-semibold text-gray-700">{s.rating}</span>
          <span className="text-xs text-gray-400">({s.reviews})</span>
        </div>
        <a
          href={`tel:${s.phone.replace(/\s/g, "")}`}
          className="flex items-center gap-1.5 text-xs font-semibold text-violet-700 border border-violet-200 hover:bg-violet-50 px-3 py-1.5 rounded-lg transition-colors"
        >
          <Phone className="w-3.5 h-3.5" /> Enquire
        </a>
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

  useEffect(() => {
    const s = searchParams.get("sub") ?? "all";
    setSubFilter(subtypes.includes(s) ? s : "all");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const handleFilter = (s: string) => {
    setSubFilter(s);
    router.replace(s === "all" ? "/events/spaces" : `/events/spaces?sub=${encodeURIComponent(s)}`, { scroll: false });
  };

  const filtered = subFilter === "all"
    ? SPACES
    : SPACES.filter((s) => s.type === subFilter);

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
              All <span className="ml-1 text-gray-400">({SPACES.length})</span>
            </button>
            {subtypes.map((st) => {
              const count = SPACES.filter((s) => s.type === st).length;
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
                  {st} <span className="ml-1 opacity-60">({count})</span>
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
                {filtered.length} venue{filtered.length !== 1 ? "s" : ""} in Neopolis
              </p>
            </div>
            <Link href="/events" className="text-violet-600 text-sm font-semibold flex items-center gap-1 hover:text-violet-700">
              Upcoming Events <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((s) => <SpaceCard key={s.name} s={s} />)}
          </div>
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
