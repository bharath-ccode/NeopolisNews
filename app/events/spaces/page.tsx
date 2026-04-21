import Link from "next/link";
import {
  Landmark,
  Wine,
  Trees,
  Users,
  MapPin,
  Phone,
  Clock,
  CheckCircle,
  ArrowRight,
  CalendarDays,
  Star,
} from "lucide-react";
import SectionWrapper from "@/components/SectionWrapper";
import LeadForm from "@/components/LeadForm";

export const metadata = {
  title: "Event Spaces – NeopolisNews",
  description:
    "Convention centres, banquet halls, and outdoor event spaces available for hire in the Neopolis district.",
};

const VENUE_TYPES = [
  { id: "convention", Icon: Landmark, label: "Convention Centres", color: "bg-violet-50 text-violet-600" },
  { id: "banquet",    Icon: Wine,     label: "Banquet Halls",      color: "bg-rose-50 text-rose-600"    },
  { id: "outdoor",    Icon: Trees,    label: "Outdoor Spaces",     color: "bg-lime-50 text-lime-600"    },
];

const SPACES = [
  {
    id: 1,
    type: "Convention Centre",
    typeColor: "bg-violet-50 text-violet-700",
    Icon: Landmark,
    iconBg: "bg-violet-100",
    iconColor: "text-violet-600",
    name: "Neopolis Convention & Exhibition Centre",
    location: "Block A, Commercial Zone",
    phone: "+91 99002 00001",
    capacity: "up to 2,000",
    area: "8,500 sq ft (divisible)",
    hours: "Available 24 / 7 (booking required)",
    rating: 4.7,
    reviews: 84,
    amenities: ["AV & Stage Setup", "Catering Kitchen", "Green Room", "Ample Parking", "High-Speed Wi-Fi", "Breakout Halls"],
    description: "Neopolis's largest event venue — divisible into three halls. Ideal for corporate conferences, exhibitions, product launches, and large-scale gatherings.",
    featured: true,
  },
  {
    id: 2,
    type: "Banquet Hall",
    typeColor: "bg-rose-50 text-rose-700",
    Icon: Wine,
    iconBg: "bg-rose-100",
    iconColor: "text-rose-600",
    name: "The Grand Ballroom — Neopolis",
    location: "Tower 5, Hospitality Block",
    phone: "+91 99002 00011",
    capacity: "up to 600",
    area: "3,200 sq ft",
    hours: "Mon – Sun, 10 AM – 12 AM",
    rating: 4.8,
    reviews: 136,
    amenities: ["In-house Catering", "Décor & Floral", "Dance Floor", "Stage & DJ Console", "Valet Parking", "Bridal Suite"],
    description: "An elegant ballroom for weddings, receptions, milestone celebrations, and gala dinners. Full catering and décor packages available.",
    featured: true,
  },
  {
    id: 3,
    type: "Outdoor Space",
    typeColor: "bg-lime-50 text-lime-700",
    Icon: Trees,
    iconBg: "bg-lime-100",
    iconColor: "text-lime-600",
    name: "Central Park Amphitheatre",
    location: "Central Park, District Core",
    phone: "+91 99002 00021",
    capacity: "up to 3,000 (standing) / 1,500 (seated)",
    area: "Open-air, 12,000 sq ft",
    hours: "Available 7 AM – 11 PM",
    rating: 4.6,
    reviews: 52,
    amenities: ["Professional Stage", "Sound & Lighting Rig", "Backstage Area", "Food Vendor Zones", "Accessible Pathways"],
    description: "A naturally landscaped open-air amphitheatre — the go-to venue for music festivals, community days, marathons, and outdoor film screenings.",
    featured: true,
  },
  {
    id: 4,
    type: "Convention Centre",
    typeColor: "bg-violet-50 text-violet-700",
    Icon: Landmark,
    iconBg: "bg-violet-100",
    iconColor: "text-violet-600",
    name: "Apex Business Conference Hub",
    location: "Tower 3, Business Park",
    phone: "+91 99002 00031",
    capacity: "up to 400",
    area: "2,400 sq ft (3 meeting rooms)",
    hours: "Mon – Sat, 8 AM – 10 PM",
    rating: 4.5,
    reviews: 61,
    amenities: ["Video Conferencing", "AV Equipment", "Catering Service", "Dedicated Reception", "Underground Parking"],
    description: "Three configurable meeting and seminar rooms ideal for corporate training, AGMs, seminars, and investor presentations.",
    featured: false,
  },
  {
    id: 5,
    type: "Banquet Hall",
    typeColor: "bg-rose-50 text-rose-700",
    Icon: Wine,
    iconBg: "bg-rose-100",
    iconColor: "text-rose-600",
    name: "Neopolis Terrace Banquets",
    location: "Rooftop, Commercial Block C",
    phone: "+91 99002 00041",
    capacity: "up to 250",
    area: "1,800 sq ft open terrace",
    hours: "Mon – Sun, 12 PM – 12 AM",
    rating: 4.4,
    reviews: 47,
    amenities: ["Skyline View", "Open Bar Setup", "Live Counter Catering", "Photobooth Corner", "Ample Parking"],
    description: "A rooftop venue with panoramic views of the Neopolis skyline. Perfect for intimate weddings, cocktail parties, and milestone dinners.",
    featured: false,
  },
  {
    id: 6,
    type: "Outdoor Space",
    typeColor: "bg-lime-50 text-lime-700",
    Icon: Trees,
    iconBg: "bg-lime-100",
    iconColor: "text-lime-600",
    name: "East Lawn & Events Ground",
    location: "East Precinct, Neopolis",
    phone: "+91 99002 00051",
    capacity: "up to 5,000",
    area: "2.5 acres open ground",
    hours: "Available 6 AM – 10 PM",
    rating: 4.3,
    reviews: 29,
    amenities: ["Flexible Layout", "Power & Water Points", "Food Court Area", "Security Fencing Available", "Ample Parking"],
    description: "The largest open ground in the district — suited for large fairs, car shows, sporting events, and community festivals.",
    featured: false,
  },
];

export default function EventSpacesPage() {
  const featured = SPACES.filter((s) => s.featured);
  const rest = SPACES.filter((s) => !s.featured);

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
              Find the Perfect{" "}
              <span className="text-violet-300">Venue</span>
            </h1>
            <p className="text-violet-100 text-lg mb-6">
              Convention centres, banquet halls, and outdoor event grounds in
              the Neopolis district — all bookable through one directory.
            </p>
            <div className="flex flex-wrap gap-3">
              {VENUE_TYPES.map(({ id, Icon, label, color }) => (
                <a
                  key={id}
                  href={`#${id}`}
                  className="inline-flex items-center gap-2 bg-violet-800 border border-violet-600 hover:bg-violet-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
                >
                  <Icon className="w-4 h-4" /> {label}
                </a>
              ))}
            </div>
          </div>
        </SectionWrapper>
      </section>

      {/* ── Type filter ── */}
      <section className="bg-white border-b border-gray-100">
        <SectionWrapper tight>
          <div className="grid grid-cols-3 gap-3">
            {VENUE_TYPES.map(({ id, Icon, label, color }) => (
              <a
                key={id}
                href={`#${id}`}
                className="flex items-center gap-3 p-4 rounded-xl border border-gray-100 hover:border-violet-300 hover:shadow-sm transition-all group"
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-sm font-semibold text-gray-700">{label}</span>
                <ArrowRight className="w-4 h-4 text-gray-300 ml-auto group-hover:text-violet-400 transition-colors" />
              </a>
            ))}
          </div>
        </SectionWrapper>
      </section>

      {/* ── Featured venues ── */}
      <SectionWrapper>
        <div className="flex items-center justify-between mb-6">
          <h2 className="section-heading">Featured Venues</h2>
          <Link href="/events" className="text-brand-600 text-sm font-semibold flex items-center gap-1">
            Upcoming Events <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-5 mb-12">
          {featured.map((s) => (
            <div key={s.id} className="card p-5 space-y-4">
              <div className="flex items-start justify-between">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${s.iconBg}`}>
                  <s.Icon className={`w-6 h-6 ${s.iconColor}`} />
                </div>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${s.typeColor}`}>{s.type}</span>
              </div>
              <div>
                <h3 className="font-bold text-gray-900">{s.name}</h3>
                <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3 h-3" /> {s.location}
                </p>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">{s.description}</p>
              <div className="space-y-1.5 text-xs text-gray-500">
                <p className="flex items-center gap-2"><Users className="w-3.5 h-3.5 text-gray-400" /> Capacity: {s.capacity}</p>
                <p className="flex items-center gap-2"><Landmark className="w-3.5 h-3.5 text-gray-400" /> Area: {s.area}</p>
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
          ))}
        </div>

        {/* ── All other venues ── */}
        <h2 className="section-heading mb-5">More Venues</h2>
        <div className="space-y-3">
          {rest.map((s) => (
            <div key={s.id} className="card p-5 flex flex-col sm:flex-row sm:items-center gap-4">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${s.iconBg}`}>
                <s.Icon className={`w-5 h-5 ${s.iconColor}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-0.5">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${s.typeColor}`}>{s.type}</span>
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                    <span className="text-xs font-semibold text-gray-600">{s.rating}</span>
                    <span className="text-xs text-gray-400">({s.reviews})</span>
                  </div>
                </div>
                <h3 className="font-bold text-gray-900 text-sm">{s.name}</h3>
                <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-1">
                  <p className="text-xs text-gray-500 flex items-center gap-1"><MapPin className="w-3 h-3" /> {s.location}</p>
                  <p className="text-xs text-gray-500 flex items-center gap-1"><Users className="w-3 h-3" /> {s.capacity}</p>
                  <p className="text-xs text-gray-500 flex items-center gap-1"><Clock className="w-3 h-3" /> {s.hours}</p>
                </div>
              </div>
              <a
                href={`tel:${s.phone.replace(/\s/g, "")}`}
                className="flex items-center gap-2 border border-gray-200 hover:border-violet-400 hover:text-violet-700 text-gray-600 text-xs font-semibold py-2 px-4 rounded-lg transition-colors shrink-0 whitespace-nowrap"
              >
                <Phone className="w-3.5 h-3.5" /> {s.phone}
              </a>
            </div>
          ))}
        </div>
      </SectionWrapper>

      {/* ── Register CTA ── */}
      <section className="bg-violet-900 text-white">
        <SectionWrapper>
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
                List Your Event Space
              </h2>
              <p className="text-violet-200 mb-5">
                Get your venue in front of event planners, corporates, and
                residents actively searching for spaces in Neopolis.
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
