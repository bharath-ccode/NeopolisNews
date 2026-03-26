import Link from "next/link";
import {
  ShoppingBag,
  Utensils,
  Film,
  Dumbbell,
  Scissors,
  Coffee,
  Star,
  Clock,
  Phone,
  ArrowRight,
  CheckCircle,
  Search,
} from "lucide-react";
import SectionWrapper from "@/components/SectionWrapper";
import LeadForm from "@/components/LeadForm";

export const metadata = {
  title: "Commercial & Lifestyle Directory – NeopolisNews",
  description:
    "Discover every brand, restaurant, cinema, gym, and salon in the Neopolis urban district.",
};

const CATEGORIES = [
  { id: "mall", icon: ShoppingBag, label: "Mall & Fashion", count: 82, color: "bg-blue-50 text-blue-600" },
  { id: "food", icon: Utensils, label: "Restaurants & Cafes", count: 64, color: "bg-orange-50 text-orange-600" },
  { id: "entertainment", icon: Film, label: "Entertainment", count: 14, color: "bg-purple-50 text-purple-600" },
  { id: "fitness", icon: Dumbbell, label: "Fitness & Wellness", count: 22, color: "bg-green-50 text-green-600" },
  { id: "beauty", icon: Scissors, label: "Beauty & Salons", count: 18, color: "bg-pink-50 text-pink-600" },
  { id: "cafe", icon: Coffee, label: "Cafes & Quick Bites", count: 31, color: "bg-yellow-50 text-yellow-600" },
];

const FEATURED_BRANDS = [
  {
    category: "Mall & Fashion",
    catColor: "tag-blue",
    name: "Zara – Neopolis Grand Mall",
    floor: "Ground Floor, G-12",
    hours: "10:00 AM – 10:00 PM",
    rating: 4.5,
    reviews: 210,
    offer: "End of Season Sale — Up to 50% off",
    sponsored: true,
  },
  {
    category: "Restaurant",
    catColor: "tag-orange",
    name: "Barbeque Nation — Neopolis",
    floor: "3rd Floor, F&B Zone",
    hours: "12:00 PM – 11:00 PM",
    rating: 4.3,
    reviews: 892,
    offer: "Live Grill Buffet — Weekday ₹799",
    sponsored: true,
  },
  {
    category: "Entertainment",
    catColor: "tag-purple",
    name: "PVR Cinemas — Neopolis (8 screens)",
    floor: "4th & 5th Floor",
    hours: "10:00 AM – 12:00 AM",
    rating: 4.6,
    reviews: 1400,
    offer: "Tuesday Blockbuster — ₹99 all shows",
    sponsored: true,
  },
  {
    category: "Fitness",
    catColor: "tag-green",
    name: "Cult.fit Neopolis",
    floor: "Podium Level, P-4",
    hours: "5:30 AM – 10:30 PM",
    rating: 4.4,
    reviews: 342,
    offer: "First month free with annual membership",
    sponsored: false,
  },
  {
    category: "Cafe",
    catColor: "tag-orange",
    name: "Starbucks Reserve — Neopolis",
    floor: "Ground Floor, Lobby",
    hours: "7:00 AM – 11:00 PM",
    rating: 4.5,
    reviews: 560,
    offer: null,
    sponsored: false,
  },
  {
    category: "Beauty",
    catColor: "tag-blue",
    name: "Looks Salon & Spa",
    floor: "2nd Floor, B-18",
    hours: "9:00 AM – 9:00 PM",
    rating: 4.2,
    reviews: 187,
    offer: "Bridal packages available — Book in advance",
    sponsored: false,
  },
];

const UPCOMING_EVENTS = [
  {
    name: "Neopolis Food Festival 2026",
    date: "Apr 5–7, 2026",
    venue: "Grand Mall Atrium",
    tag: "Food & Lifestyle",
    tagColor: "tag-orange",
  },
  {
    name: "Pre-Release Screening — Summer Blockbuster",
    date: "Apr 12, 2026",
    venue: "PVR Neopolis",
    tag: "Entertainment",
    tagColor: "tag-purple",
  },
  {
    name: "Fit Neopolis Marathon & Wellness Expo",
    date: "Apr 19, 2026",
    venue: "District Central Park",
    tag: "Fitness",
    tagColor: "tag-green",
  },
  {
    name: "Neopolis Fashion Week — Opening Night",
    date: "May 3, 2026",
    venue: "Neopolis Grand Mall",
    tag: "Fashion",
    tagColor: "tag-blue",
  },
];

const BUSINESS_PLANS = [
  {
    name: "Basic Profile",
    price: "₹5,000/mo",
    features: ["Business listing", "Hours & contact", "Google Maps embed"],
    highlight: false,
  },
  {
    name: "Growth",
    price: "₹20,000/mo",
    features: [
      "Featured placement",
      "Offers & events posting",
      "Banner ads",
      "Analytics dashboard",
    ],
    highlight: true,
  },
  {
    name: "Premium Brand",
    price: "₹50,000/mo",
    features: [
      "Sponsored homepage slot",
      "Event co-branding",
      "Sponsored articles",
      "Display ads across site",
      "Priority customer reviews",
    ],
    highlight: false,
  },
];

export default function DirectoryPage() {
  return (
    <>
      {/* ── Hero ── */}
      <section className="bg-gradient-to-br from-purple-900 to-purple-700 text-white py-14 md:py-20">
        <SectionWrapper tight>
          <div className="max-w-3xl">
            <span className="tag-purple mb-4">Commercial & Lifestyle Directory</span>
            <h1 className="text-3xl md:text-5xl font-extrabold mt-3 mb-4">
              Discover Neopolis&apos;s{" "}
              <span className="text-purple-300">Best Brands</span>
            </h1>
            <p className="text-purple-100 text-lg mb-6">
              Every store, restaurant, cinema, gym, and salon in the district
              — with hours, offers, and events, all in one place.
            </p>
            {/* Search bar */}
            <div className="flex gap-2 bg-white/10 backdrop-blur rounded-xl p-2 max-w-lg">
              <div className="flex-1 flex items-center gap-2 bg-white rounded-lg px-3">
                <Search className="w-4 h-4 text-gray-400 shrink-0" />
                <input
                  type="text"
                  placeholder="Search brands, categories..."
                  className="w-full py-2.5 text-gray-900 text-sm outline-none"
                  readOnly
                />
              </div>
              <button className="btn-primary py-2 px-4 rounded-lg text-sm shrink-0">
                Search
              </button>
            </div>
          </div>
        </SectionWrapper>
      </section>

      {/* ── Categories ── */}
      <section className="bg-white border-b border-gray-100">
        <SectionWrapper tight>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {CATEGORIES.map((c) => (
              <a
                key={c.id}
                href={`#${c.id}`}
                className="flex flex-col items-center gap-2 p-3 rounded-xl border border-gray-100 hover:border-purple-300 hover:shadow-sm transition-all group"
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${c.color}`}>
                  <c.icon className="w-5 h-5" />
                </div>
                <span className="text-xs font-semibold text-gray-700 text-center leading-tight">
                  {c.label}
                </span>
                <span className="text-xs text-gray-400">{c.count}</span>
              </a>
            ))}
          </div>
        </SectionWrapper>
      </section>

      {/* ── Featured Brands ── */}
      <SectionWrapper id="brands">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="section-heading">Featured Businesses</h2>
            <p className="text-gray-500 text-sm mt-1">231 businesses listed · Updated weekly</p>
          </div>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURED_BRANDS.map((b) => (
            <div key={b.name} className={`card p-5 relative ${b.sponsored ? "ring-2 ring-purple-300" : ""}`}>
              {b.sponsored && (
                <span className="absolute top-3 right-3 tag-purple text-xs">Ad</span>
              )}
              {/* Logo placeholder */}
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center mb-3">
                <ShoppingBag className="w-6 h-6 text-purple-400" />
              </div>
              <span className={`${b.catColor} mb-2`}>{b.category}</span>
              <h3 className="font-bold text-gray-900 text-sm mt-2 mb-1">{b.name}</h3>
              <p className="text-xs text-gray-500 mb-1">{b.floor}</p>
              <div className="flex items-center gap-1 mb-2">
                <Clock className="w-3.5 h-3.5 text-gray-400" />
                <span className="text-xs text-gray-500">{b.hours}</span>
              </div>
              <div className="flex items-center gap-1 mb-3">
                <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                <span className="text-xs font-semibold text-gray-700">{b.rating}</span>
                <span className="text-xs text-gray-400">({b.reviews} reviews)</span>
              </div>
              {b.offer && (
                <div className="bg-orange-50 border border-orange-100 rounded-lg px-3 py-2 mb-3">
                  <p className="text-xs text-orange-700 font-semibold">{b.offer}</p>
                </div>
              )}
              <button className="flex items-center justify-center gap-2 w-full border border-gray-200 hover:border-purple-400 hover:text-purple-700 text-gray-600 text-xs font-semibold py-2 rounded-lg transition-colors">
                <Phone className="w-3.5 h-3.5" /> Contact
              </button>
            </div>
          ))}
        </div>
      </SectionWrapper>

      {/* ── Events ── */}
      <section className="bg-gray-50" id="events">
        <SectionWrapper>
          <div className="flex items-center justify-between mb-8">
            <h2 className="section-heading">Upcoming Events</h2>
            <Link href="/news" className="text-brand-600 text-sm font-semibold flex items-center gap-1">
              All events <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {UPCOMING_EVENTS.map((e) => (
              <div key={e.name} className="card p-5 flex gap-4">
                <div className="w-14 h-14 bg-purple-100 rounded-xl flex flex-col items-center justify-center shrink-0">
                  <Film className="w-6 h-6 text-purple-500" />
                </div>
                <div>
                  <span className={`${e.tagColor} mb-1`}>{e.tag}</span>
                  <h3 className="font-bold text-gray-900 text-sm mt-1.5 mb-1">{e.name}</h3>
                  <p className="text-xs text-gray-500">{e.date} · {e.venue}</p>
                </div>
              </div>
            ))}
          </div>
        </SectionWrapper>
      </section>

      {/* ── Business Plans ── */}
      <SectionWrapper id="business-plans">
        <div className="text-center mb-10">
          <h2 className="section-heading">List Your Business</h2>
          <p className="text-gray-500 mt-2">
            Reach 12,000+ residents, shoppers, and office workers in Neopolis.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-5 max-w-4xl mx-auto">
          {BUSINESS_PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`card p-6 ${plan.highlight ? "ring-2 ring-purple-500 relative" : ""}`}
            >
              {plan.highlight && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                  Most Popular
                </span>
              )}
              <h3 className="font-bold text-lg text-gray-900 mb-1">{plan.name}</h3>
              <p className="text-3xl font-extrabold text-purple-700 mb-4">{plan.price}</p>
              <ul className="space-y-2 mb-6">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/advertise"
                className={`block text-center font-semibold py-2.5 rounded-lg text-sm transition-colors ${
                  plan.highlight
                    ? "bg-purple-600 text-white hover:bg-purple-700"
                    : "border border-purple-300 text-purple-600 hover:bg-purple-50"
                }`}
              >
                Get Started
              </Link>
            </div>
          ))}
        </div>
      </SectionWrapper>

      {/* ── Lead Form ── */}
      <section className="bg-brand-950 text-white">
        <SectionWrapper>
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
                Opening a Store in Neopolis?
              </h2>
              <p className="text-brand-300 mb-5">
                Get discovered on day one. Our team will set up your profile,
                publish your offers, and help you reach residents before you
                even open your doors.
              </p>
              <ul className="space-y-2 text-sm text-brand-200">
                {[
                  "Pre-opening buzz campaigns",
                  "Grand opening event coverage",
                  "Social proof via reviews",
                  "Footfall analytics",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-brand-900 rounded-2xl border border-brand-700 p-6">
              <LeadForm
                title="Register Your Business"
                subtitle="We'll reach out to set up your profile and discuss the best plan."
                purpose="business-directory"
                dark
              />
            </div>
          </div>
        </SectionWrapper>
      </section>
    </>
  );
}
