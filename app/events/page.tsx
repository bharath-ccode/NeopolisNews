import Link from "next/link";
import {
  CalendarDays,
  Music,
  Trophy,
  Utensils,
  Users,
  Ticket,
  MapPin,
  Clock,
  ArrowRight,
  CheckCircle,
  Landmark,
} from "lucide-react";
import SectionWrapper from "@/components/SectionWrapper";

export const metadata = {
  title: "Upcoming Events – NeopolisNews",
  description:
    "Music concerts, marathons, food festivals, and community events in the Neopolis district.",
};

type EventCategory = {
  id: string;
  label: string;
  Icon: React.ComponentType<{ className?: string }>;
  color: string;
};

const CATEGORIES: EventCategory[] = [
  { id: "music",     label: "Music & Concerts",  Icon: Music,        color: "bg-purple-50 text-purple-600" },
  { id: "sports",    label: "Sports & Runs",     Icon: Trophy,       color: "bg-orange-50 text-orange-600" },
  { id: "food",      label: "Food & Lifestyle",  Icon: Utensils,     color: "bg-yellow-50 text-yellow-700" },
  { id: "community", label: "Community",         Icon: Users,        color: "bg-blue-50 text-blue-600"     },
  { id: "venue",     label: "Venue Events",      Icon: Landmark,     color: "bg-violet-50 text-violet-600" },
];

const EVENTS = [
  {
    id: 1,
    title: "Neopolis Summer Music Festival",
    category: "Music & Concerts",
    catColor: "bg-purple-50 text-purple-700",
    date: "Sat, 19 Apr 2026",
    time: "5:00 PM – 11:00 PM",
    venue: "Neopolis Central Park Amphitheatre",
    description: "Three stages, 12 artists, and a night of live music across genres — pop, indie, and electronic.",
    ticketPrice: "₹499 onwards",
    ticketsLeft: 320,
    featured: true,
    tags: ["Live Music", "Outdoor", "All Ages"],
  },
  {
    id: 2,
    title: "Neopolis Half Marathon 2026",
    category: "Sports & Runs",
    catColor: "bg-orange-50 text-orange-700",
    date: "Sun, 27 Apr 2026",
    time: "5:30 AM – 10:00 AM",
    venue: "Neopolis District Ring Road",
    description: "21 km, 10 km, and 5 km categories open for all fitness levels. Certified timing chips and medals for finishers.",
    ticketPrice: "₹799",
    ticketsLeft: 145,
    featured: true,
    tags: ["Running", "Outdoor", "Prizes"],
  },
  {
    id: 3,
    title: "Neopolis Food & Craft Festival",
    category: "Food & Lifestyle",
    catColor: "bg-yellow-50 text-yellow-700",
    date: "Fri–Sun, 2–4 May 2026",
    time: "11:00 AM – 10:00 PM",
    venue: "Grand Mall Atrium, Level 1",
    description: "40+ food vendors, live cooking demos, craft stalls, and a kids' zone over three days.",
    ticketPrice: "Free entry",
    ticketsLeft: null,
    featured: false,
    tags: ["Food", "Family", "Free"],
  },
  {
    id: 4,
    title: "Neopolis Standup Comedy Night",
    category: "Music & Concerts",
    catColor: "bg-purple-50 text-purple-700",
    date: "Sat, 10 May 2026",
    time: "7:30 PM – 10:00 PM",
    venue: "The Convention Centre, Hall B",
    description: "An evening of stand-up with four headlining comedians. Seating limited to 400.",
    ticketPrice: "₹699",
    ticketsLeft: 88,
    featured: false,
    tags: ["Comedy", "Indoor", "18+"],
  },
  {
    id: 5,
    title: "District Wellness & Yoga Morning",
    category: "Community",
    catColor: "bg-blue-50 text-blue-700",
    date: "Sun, 18 May 2026",
    time: "6:30 AM – 8:30 AM",
    venue: "Central Park, East Lawn",
    description: "A free community yoga and mindfulness session led by certified instructors. Bring your own mat.",
    ticketPrice: "Free",
    ticketsLeft: null,
    featured: false,
    tags: ["Wellness", "Outdoor", "Free"],
  },
  {
    id: 6,
    title: "Neopolis Startup Demo Day",
    category: "Community",
    catColor: "bg-blue-50 text-blue-700",
    date: "Fri, 23 May 2026",
    time: "2:00 PM – 7:00 PM",
    venue: "Neopolis Convention Centre, Hall A",
    description: "20 district-based startups present to investors and residents. Open to the public for the final session.",
    ticketPrice: "Free",
    ticketsLeft: null,
    featured: false,
    tags: ["Business", "Networking", "Indoor"],
  },
  {
    id: 7,
    title: "Cycling Criterium — Neopolis Sprint Cup",
    category: "Sports & Runs",
    catColor: "bg-orange-50 text-orange-700",
    date: "Sun, 1 Jun 2026",
    time: "6:00 AM – 9:00 AM",
    venue: "Neopolis Boulevard Circuit",
    description: "A closed-circuit criterium race for amateur and competitive cyclists. Separate heats by category.",
    ticketPrice: "₹500 (registration)",
    ticketsLeft: 60,
    featured: false,
    tags: ["Cycling", "Outdoor", "Competitive"],
  },
  {
    id: 8,
    title: "Neopolis Dine-Around Evening",
    category: "Food & Lifestyle",
    catColor: "bg-yellow-50 text-yellow-700",
    date: "Sat, 7 Jun 2026",
    time: "7:00 PM – 11:00 PM",
    venue: "F&B Strip, Neopolis Boulevard",
    description: "Wristband access to tasting portions at 18 restaurants along the boulevard. One price, unlimited rounds.",
    ticketPrice: "₹1,299",
    ticketsLeft: 200,
    featured: false,
    tags: ["Food", "Social", "Adult"],
  },
];

const CATEGORY_ICON: Record<string, React.ComponentType<{ className?: string }>> = {
  "Music & Concerts": Music,
  "Sports & Runs":    Trophy,
  "Food & Lifestyle": Utensils,
  "Community":        Users,
  "Venue Events":     Landmark,
};

export default function EventsPage() {
  const featured = EVENTS.filter((e) => e.featured);
  const rest = EVENTS.filter((e) => !e.featured);

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
            <p className="text-violet-100 text-lg mb-6">
              Concerts, marathons, food festivals, community days, and more —
              happening right here in the district.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/events/spaces"
                className="inline-flex items-center gap-2 bg-white text-violet-700 font-bold px-5 py-2.5 rounded-xl text-sm hover:bg-violet-50 transition-colors"
              >
                <Landmark className="w-4 h-4" /> Browse Event Spaces
              </Link>
              <a
                href="#all-events"
                className="inline-flex items-center gap-2 bg-violet-600 border border-violet-500 text-white font-semibold px-5 py-2.5 rounded-xl text-sm hover:bg-violet-500 transition-colors"
              >
                <CalendarDays className="w-4 h-4" /> See All Events
              </a>
            </div>
          </div>
        </SectionWrapper>
      </section>

      {/* ── Category filter bar ── */}
      <section className="bg-white border-b border-gray-100">
        <SectionWrapper tight>
          <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-none">
            {CATEGORIES.map(({ id, label, Icon, color }) => (
              <a
                key={id}
                href={`#${id}`}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-100 hover:border-violet-300 hover:shadow-sm transition-all shrink-0"
              >
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-sm font-semibold text-gray-700 whitespace-nowrap">{label}</span>
              </a>
            ))}
          </div>
        </SectionWrapper>
      </section>

      {/* ── Featured events ── */}
      <SectionWrapper>
        <h2 className="section-heading mb-6">Featured This Month</h2>
        <div className="grid md:grid-cols-2 gap-5 mb-12">
          {featured.map((e) => {
            const Icon = CATEGORY_ICON[e.category] ?? CalendarDays;
            return (
              <div key={e.id} className="card p-6 ring-2 ring-violet-200 relative">
                <span className="absolute top-4 right-4 text-xs font-bold bg-violet-600 text-white px-2.5 py-1 rounded-full">
                  Featured
                </span>
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-violet-100 flex items-center justify-center shrink-0">
                    <Icon className="w-6 h-6 text-violet-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${e.catColor}`}>{e.category}</span>
                    <h3 className="font-extrabold text-gray-900 text-lg mt-2 leading-snug">{e.title}</h3>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-4">{e.description}</p>
                <div className="space-y-1.5 mb-4">
                  <p className="text-xs text-gray-500 flex items-center gap-2">
                    <CalendarDays className="w-3.5 h-3.5 text-gray-400" /> {e.date}
                  </p>
                  <p className="text-xs text-gray-500 flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-gray-400" /> {e.time}
                  </p>
                  <p className="text-xs text-gray-500 flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-gray-400" /> {e.venue}
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-lg font-extrabold text-violet-700">{e.ticketPrice}</p>
                    {e.ticketsLeft && (
                      <p className="text-xs text-orange-600 font-semibold">{e.ticketsLeft} spots left</p>
                    )}
                  </div>
                  <button className="btn-primary text-sm py-2">
                    <Ticket className="w-4 h-4" /> Get Tickets
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── All events ── */}
        <div id="all-events">
          <h2 className="section-heading mb-6">All Upcoming Events</h2>
          <div className="space-y-3">
            {rest.map((e) => {
              const Icon = CATEGORY_ICON[e.category] ?? CalendarDays;
              return (
                <div key={e.id} className="card p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="w-11 h-11 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-gray-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${e.catColor}`}>{e.category}</span>
                      {e.tags.map((t) => (
                        <span key={t} className="text-xs text-gray-400 bg-gray-50 border border-gray-100 px-2 py-0.5 rounded-full">{t}</span>
                      ))}
                    </div>
                    <h3 className="font-bold text-gray-900 text-sm">{e.title}</h3>
                    <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-1">
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <CalendarDays className="w-3 h-3" /> {e.date} · {e.time}
                      </p>
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {e.venue}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <p className="font-bold text-violet-700 text-sm">{e.ticketPrice}</p>
                      {e.ticketsLeft && (
                        <p className="text-xs text-orange-500">{e.ticketsLeft} left</p>
                      )}
                    </div>
                    <button className="btn-secondary text-xs py-2 px-3 whitespace-nowrap">
                      <Ticket className="w-3.5 h-3.5" /> Register
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </SectionWrapper>

      {/* ── List your event CTA ── */}
      <section className="bg-violet-900 text-white py-14">
        <SectionWrapper tight>
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="max-w-xl">
              <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-3">
                Hosting an Event in Neopolis?
              </h2>
              <p className="text-violet-200 mb-5">
                Get it in front of 12,000+ district residents. We list concerts,
                runs, food events, community days, and corporate gatherings.
              </p>
              <ul className="space-y-2 text-sm text-violet-100">
                {[
                  "Listed on Events page and Home feed",
                  "Promoted in weekly newsletter",
                  "Ticket / registration link included",
                  "Event recap article available",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-violet-400 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex flex-col gap-3 shrink-0">
              <Link
                href="/advertise"
                className="inline-flex items-center justify-center gap-2 bg-white text-violet-700 font-bold px-8 py-3.5 rounded-xl text-sm hover:bg-violet-50 transition-colors"
              >
                List Your Event <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/events/spaces"
                className="inline-flex items-center justify-center gap-2 bg-violet-700 border border-violet-500 text-white font-semibold px-8 py-3 rounded-xl text-sm hover:bg-violet-600 transition-colors"
              >
                <Landmark className="w-4 h-4" /> Find an Event Space
              </Link>
            </div>
          </div>
        </SectionWrapper>
      </section>
    </>
  );
}
