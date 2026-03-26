import Link from "next/link";
import {
  Home,
  Building2,
  ShoppingBag,
  CheckCircle,
  ArrowRight,
  Bed,
  Bath,
  Maximize2,
  Car,
  Phone,
} from "lucide-react";
import SectionWrapper from "@/components/SectionWrapper";
import LeadForm from "@/components/LeadForm";

export const metadata = {
  title: "Rentals & Resale – NeopolisNews",
  description:
    "Find residential rentals, office leasing, retail spaces, and resale listings in the Neopolis urban district.",
};

const SEGMENTS = [
  { id: "residential", icon: Home, label: "Residential Rentals", count: 148 },
  { id: "office", icon: Building2, label: "Office Leasing", count: 34 },
  { id: "retail", icon: ShoppingBag, label: "Retail Spaces", count: 56 },
  { id: "resale", icon: Home, label: "Resale Listings", count: 92 },
];

const LISTINGS = [
  {
    id: "r1",
    type: "residential",
    tag: "Residential Rental",
    tagColor: "tag-green",
    title: "3 BHK in Apex Tower — Tower B, 24th Floor",
    price: "₹55,000/mo",
    deposit: "₹3.3 L",
    specs: { beds: 3, baths: 2, area: "1,450 sq ft", parking: 1 },
    available: "April 15, 2026",
    owner: "Verified Owner",
    verified: true,
    featured: true,
  },
  {
    id: "r2",
    type: "residential",
    tag: "Residential Rental",
    tagColor: "tag-green",
    title: "2 BHK in Neopolis Heights — Tower A, 12th Floor",
    price: "₹32,000/mo",
    deposit: "₹1.92 L",
    specs: { beds: 2, baths: 2, area: "980 sq ft", parking: 1 },
    available: "Immediate",
    owner: "Broker",
    verified: false,
    featured: false,
  },
  {
    id: "r3",
    type: "resale",
    tag: "Resale",
    tagColor: "tag-blue",
    title: "4 BHK Penthouse — Sky Residences, 52nd Floor",
    price: "₹8.5 Cr",
    deposit: null,
    specs: { beds: 4, baths: 4, area: "3,800 sq ft", parking: 2 },
    available: "Negotiable",
    owner: "Verified Owner",
    verified: true,
    featured: true,
  },
  {
    id: "r4",
    type: "office",
    tag: "Office Leasing",
    tagColor: "tag-purple",
    title: "Ready Office Space — Business Park, Block C",
    price: "₹1.1 L/mo",
    deposit: "₹3.3 L",
    specs: { beds: 0, baths: 4, area: "1,100 sq ft", parking: 3 },
    available: "Immediate",
    owner: "Direct Owner",
    verified: true,
    featured: false,
  },
  {
    id: "r5",
    type: "retail",
    tag: "Retail Space",
    tagColor: "tag-orange",
    title: "Ground Floor Retail Shop — Grand Mall, Sector D",
    price: "₹1.8 L/mo",
    deposit: "₹10.8 L",
    specs: { beds: 0, baths: 2, area: "600 sq ft", parking: 0 },
    available: "June 2027",
    owner: "Developer",
    verified: true,
    featured: true,
  },
  {
    id: "r6",
    type: "residential",
    tag: "Residential Rental",
    tagColor: "tag-green",
    title: "1 BHK Studio — Neopolis Heights, Tower C",
    price: "₹18,000/mo",
    deposit: "₹1.08 L",
    specs: { beds: 1, baths: 1, area: "480 sq ft", parking: 0 },
    available: "May 1, 2026",
    owner: "Verified Owner",
    verified: true,
    featured: false,
  },
];

const BROKER_PLANS = [
  {
    name: "Starter",
    price: "₹50,000/yr",
    features: [
      "10 featured listings",
      "Lead notifications",
      "Basic profile page",
      "WhatsApp enquiries",
    ],
    highlight: false,
  },
  {
    name: "Pro",
    price: "₹1,00,000/yr",
    features: [
      "Unlimited listings",
      "Priority placement",
      "Verified Broker badge",
      "CRM dashboard",
      "Monthly analytics report",
    ],
    highlight: true,
  },
  {
    name: "Elite",
    price: "₹2,00,000/yr",
    features: [
      "Everything in Pro",
      "Exclusive area pages",
      "Sponsored articles",
      "Dedicated account manager",
      "Data export & API",
    ],
    highlight: false,
  },
];

export default function RentalsPage() {
  return (
    <>
      {/* ── Hero ── */}
      <section className="bg-gradient-to-br from-green-900 to-green-700 text-white py-14 md:py-20">
        <SectionWrapper tight>
          <div className="max-w-3xl">
            <span className="tag-green mb-4">Rentals & Resale Marketplace</span>
            <h1 className="text-3xl md:text-5xl font-extrabold mt-3 mb-4">
              Find Your Space in{" "}
              <span className="text-green-300">Neopolis</span>
            </h1>
            <p className="text-green-100 text-lg mb-6">
              Verified residential rentals, Grade A office leasing, prime retail
              spaces, and resale listings — all in one marketplace.
            </p>
            <div className="flex flex-wrap gap-3">
              <a href="#listings" className="btn-primary">
                Browse Listings
              </a>
              <Link
                href="/advertise"
                className="btn-secondary border-green-500 text-green-200 hover:bg-green-800"
              >
                List Property Free <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </SectionWrapper>
      </section>

      {/* ── Segment Pills ── */}
      <section className="bg-white border-b border-gray-100">
        <SectionWrapper tight>
          <div className="flex flex-wrap gap-3">
            {SEGMENTS.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className="flex items-center gap-2 border border-gray-200 hover:border-brand-400 hover:text-brand-700 text-gray-600 rounded-full px-4 py-2 text-sm font-medium transition-colors"
              >
                <s.icon className="w-4 h-4" />
                {s.label}
                <span className="bg-gray-100 text-gray-500 text-xs px-1.5 py-0.5 rounded-full">
                  {s.count}
                </span>
              </a>
            ))}
          </div>
        </SectionWrapper>
      </section>

      {/* ── Listings ── */}
      <SectionWrapper id="listings">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="section-heading">All Listings</h2>
            <p className="text-gray-500 text-sm mt-1">
              330 active listings · Updated daily
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            {["All", "Residential", "Office", "Retail", "Resale"].map((f) => (
              <button
                key={f}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                  f === "All"
                    ? "bg-brand-600 border-brand-600 text-white"
                    : "border-gray-200 text-gray-600 hover:border-brand-400 hover:text-brand-600"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {LISTINGS.map((l) => (
            <div
              key={l.id}
              className={`card overflow-hidden relative ${
                l.featured ? "ring-2 ring-brand-400" : ""
              }`}
            >
              {l.featured && (
                <span className="absolute top-3 left-3 z-10 bg-brand-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  Featured
                </span>
              )}
              {/* Image placeholder */}
              <div className="h-36 bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center">
                <Home className="w-10 h-10 text-green-300" />
              </div>

              <div className="p-4">
                <div className="flex items-start justify-between mb-1">
                  <span className={l.tagColor}>{l.tag}</span>
                  {l.verified && (
                    <span className="flex items-center gap-0.5 text-xs text-green-600">
                      <CheckCircle className="w-3.5 h-3.5" /> Verified
                    </span>
                  )}
                </div>
                <h3 className="font-bold text-gray-900 text-sm mt-2 mb-3 leading-snug">
                  {l.title}
                </h3>

                <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-500 mb-3">
                  {l.specs.beds > 0 && (
                    <span className="flex items-center gap-1">
                      <Bed className="w-3.5 h-3.5" /> {l.specs.beds} Bed
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Bath className="w-3.5 h-3.5" /> {l.specs.baths} Bath
                  </span>
                  <span className="flex items-center gap-1">
                    <Maximize2 className="w-3.5 h-3.5" /> {l.specs.area}
                  </span>
                  {l.specs.parking > 0 && (
                    <span className="flex items-center gap-1">
                      <Car className="w-3.5 h-3.5" /> {l.specs.parking}P
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between mb-1">
                  <span className="text-xl font-extrabold text-brand-700">
                    {l.price}
                  </span>
                </div>
                {l.deposit && (
                  <p className="text-xs text-gray-400 mb-2">
                    Deposit: {l.deposit}
                  </p>
                )}
                <p className="text-xs text-gray-500 mb-3">
                  Available: <strong>{l.available}</strong> ·{" "}
                  <span className="text-gray-400">{l.owner}</span>
                </p>

                <button className="flex items-center justify-center gap-2 w-full bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold py-2 rounded-lg transition-colors">
                  <Phone className="w-4 h-4" /> Contact Owner
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-8">
          <button className="btn-secondary">
            Load More Listings <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </SectionWrapper>

      {/* ── Broker Plans ── */}
      <section className="bg-gray-50" id="broker-plans">
        <SectionWrapper>
          <div className="text-center mb-10">
            <h2 className="section-heading">Broker & Owner Plans</h2>
            <p className="text-gray-500 mt-2">
              Reach thousands of qualified buyers and tenants in Neopolis.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-5 max-w-4xl mx-auto">
            {BROKER_PLANS.map((plan) => (
              <div
                key={plan.name}
                className={`card p-6 ${
                  plan.highlight ? "ring-2 ring-brand-500 relative" : ""
                }`}
              >
                {plan.highlight && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                    Most Popular
                  </span>
                )}
                <h3 className="font-bold text-lg text-gray-900 mb-1">
                  {plan.name}
                </h3>
                <p className="text-3xl font-extrabold text-brand-700 mb-4">
                  {plan.price}
                </p>
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
                      ? "bg-brand-600 text-white hover:bg-brand-700"
                      : "border border-brand-300 text-brand-600 hover:bg-brand-50"
                  }`}
                >
                  Get Started
                </Link>
              </div>
            ))}
          </div>
        </SectionWrapper>
      </section>

      {/* ── Lead Form ── */}
      <SectionWrapper>
        <div className="grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <h2 className="section-heading mb-3">
              Can&apos;t Find What You&apos;re Looking For?
            </h2>
            <p className="text-gray-500 mb-5">
              Tell us your requirements and we&apos;ll match you with the right
              property — no spam, no cold calls.
            </p>
            <ul className="space-y-2 text-sm text-gray-600">
              {[
                "Exclusive listings not yet published",
                "Verified owner direct deals",
                "Negotiation support",
                "Legal & documentation guidance",
              ].map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" /> {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="card p-6">
            <LeadForm
              title="Post a Requirement"
              subtitle="We'll match you with the best available properties."
              purpose="rental-requirement"
            />
          </div>
        </div>
      </SectionWrapper>
    </>
  );
}
