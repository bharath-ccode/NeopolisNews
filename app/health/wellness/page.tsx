"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Sparkles,
  Dumbbell,
  Music2,
  MapPin,
  Phone,
  Clock,
  Star,
  ArrowRight,
  CheckCircle,
} from "lucide-react";
import SectionWrapper from "@/components/SectionWrapper";
import LeadForm from "@/components/LeadForm";

type WellnessType = "all" | "spa" | "gym" | "studio";

const TABS: { id: WellnessType; label: string; icon: React.ElementType; color: string }[] = [
  { id: "all",    label: "All Wellness",  icon: Sparkles, color: "bg-purple-50 text-purple-600" },
  { id: "spa",    label: "Massage Spa",   icon: Sparkles, color: "bg-pink-50 text-pink-600"     },
  { id: "gym",    label: "Gym",           icon: Dumbbell, color: "bg-blue-50 text-blue-600"     },
  { id: "studio", label: "Studio",        icon: Music2,   color: "bg-green-50 text-green-600"   },
];

interface Business {
  name: string;
  type: "spa" | "gym" | "studio";
  subtype: string;
  location: string;
  phone: string;
  hours: string;
  days: string;
  rating: number;
  tags: string[];
}

const BUSINESSES: Business[] = [
  // ── Massage Spa ──────────────────────────────────────────────────────────
  {
    name: "Serene Spa & Wellness",
    type: "spa",
    subtype: "Massage Spa",
    location: "Level 2, Neopolis Grand Mall",
    phone: "+91 90001 10001",
    hours: "10:00 AM – 9:00 PM",
    days: "Mon – Sun",
    rating: 4.8,
    tags: ["Swedish Massage", "Aromatherapy", "Couples Spa"],
  },
  {
    name: "O2 Luxury Spa",
    type: "spa",
    subtype: "Massage Spa",
    location: "Tower 1, Commercial Podium",
    phone: "+91 90001 10002",
    hours: "9:00 AM – 10:00 PM",
    days: "Mon – Sun",
    rating: 4.7,
    tags: ["Deep Tissue", "Hot Stone", "Facial Treatments"],
  },
  {
    name: "Bliss Ayurvedic Spa",
    type: "spa",
    subtype: "Massage Spa",
    location: "Healthcare Strip, Block D",
    phone: "+91 90001 10003",
    hours: "8:00 AM – 8:00 PM",
    days: "Mon – Sat",
    rating: 4.9,
    tags: ["Ayurvedic", "Abhyanga", "Shirodhara"],
  },
  {
    name: "Thai Retreat Spa",
    type: "spa",
    subtype: "Massage Spa",
    location: "Ground Floor, Lifestyle Hub",
    phone: "+91 90001 10004",
    hours: "10:00 AM – 9:00 PM",
    days: "Mon – Sun",
    rating: 4.6,
    tags: ["Thai Massage", "Reflexology", "Herbal Steam"],
  },
  {
    name: "Zen Garden Wellness",
    type: "spa",
    subtype: "Massage Spa",
    location: "Neopolis Residents Club",
    phone: "+91 90001 10005",
    hours: "7:00 AM – 9:00 PM",
    days: "Mon – Sun",
    rating: 4.8,
    tags: ["Relaxation", "Body Wraps", "Hydrotherapy"],
  },
  {
    name: "Heal & Glow Spa Studio",
    type: "spa",
    subtype: "Massage Spa",
    location: "Block E, Shop 2, Residential Strip",
    phone: "+91 90001 10006",
    hours: "9:00 AM – 8:00 PM",
    days: "Tue – Sun",
    rating: 4.5,
    tags: ["Express Massage", "Skin Glow", "Foot Spa"],
  },

  // ── Gym ──────────────────────────────────────────────────────────────────
  {
    name: "Anytime Fitness",
    type: "gym",
    subtype: "Gym",
    location: "Tower 2, Commercial Podium",
    phone: "+91 90001 20001",
    hours: "24 hours",
    days: "All days",
    rating: 4.6,
    tags: ["24/7 Access", "Cardio Zone", "Free Weights"],
  },
  {
    name: "Cult.fit Neopolis",
    type: "gym",
    subtype: "Gym",
    location: "Level 1, Lifestyle Hub",
    phone: "+91 90001 20002",
    hours: "5:30 AM – 10:00 PM",
    days: "Mon – Sun",
    rating: 4.7,
    tags: ["Group Classes", "HIIT", "Boxing"],
  },
  {
    name: "Gold's Gym",
    type: "gym",
    subtype: "Gym",
    location: "Neopolis Grand Mall, Level 3",
    phone: "+91 90001 20003",
    hours: "5:00 AM – 11:00 PM",
    days: "Mon – Sun",
    rating: 4.5,
    tags: ["Weight Training", "Cardio", "Personal Training"],
  },
  {
    name: "BodyFit 24/7",
    type: "gym",
    subtype: "Gym",
    location: "Commercial Block A, Ground Floor",
    phone: "+91 90001 20004",
    hours: "24 hours",
    days: "All days",
    rating: 4.4,
    tags: ["Strength Training", "Functional Fitness", "Steam Room"],
  },
  {
    name: "ProZone Fitness",
    type: "gym",
    subtype: "Gym",
    location: "Block C, Ground Floor",
    phone: "+91 90001 20005",
    hours: "5:00 AM – 10:00 PM",
    days: "Mon – Sat",
    rating: 4.6,
    tags: ["CrossFit Style", "Nutrition Coaching", "Locker Rooms"],
  },
  {
    name: "IronWorks Strength Studio",
    type: "gym",
    subtype: "Gym",
    location: "Block B Podium Level",
    phone: "+91 90001 20006",
    hours: "6:00 AM – 10:00 PM",
    days: "Mon – Sun",
    rating: 4.8,
    tags: ["Powerlifting", "Olympic Lifting", "1-on-1 Training"],
  },

  // ── Studio ────────────────────────────────────────────────────────────────
  {
    name: "Yoga Tree Studio",
    type: "studio",
    subtype: "Studio",
    location: "Tower 3, Podium Level",
    phone: "+91 90001 30001",
    hours: "6:00 AM – 9:00 PM",
    days: "Mon – Sun",
    rating: 4.9,
    tags: ["Hatha Yoga", "Yin Yoga", "Meditation"],
  },
  {
    name: "Pilates Lab",
    type: "studio",
    subtype: "Studio",
    location: "Commercial Strip, Block F",
    phone: "+91 90001 30002",
    hours: "7:00 AM – 8:00 PM",
    days: "Mon – Sat",
    rating: 4.8,
    tags: ["Reformer Pilates", "Mat Pilates", "Pre/Post Natal"],
  },
  {
    name: "CrossFit Neopolis",
    type: "studio",
    subtype: "Studio",
    location: "Zone 2, Industrial Block",
    phone: "+91 90001 30003",
    hours: "5:30 AM – 9:00 PM",
    days: "Mon – Sat",
    rating: 4.7,
    tags: ["CrossFit WODs", "Olympic Lifting", "Endurance"],
  },
  {
    name: "Dance Central",
    type: "studio",
    subtype: "Studio",
    location: "Level 2, Lifestyle Hub",
    phone: "+91 90001 30004",
    hours: "10:00 AM – 8:00 PM",
    days: "Mon – Sun",
    rating: 4.6,
    tags: ["Bollywood", "Contemporary", "Kids Classes"],
  },
  {
    name: "Zumba & Dance Studio",
    type: "studio",
    subtype: "Studio",
    location: "Residential Block D, Amenity Floor",
    phone: "+91 90001 30005",
    hours: "7:00 AM – 7:00 PM",
    days: "Mon – Sat",
    rating: 4.5,
    tags: ["Zumba", "Aerobics", "Salsa"],
  },
  {
    name: "MindBody Wellness Studio",
    type: "studio",
    subtype: "Studio",
    location: "Healthcare Zone, Block D",
    phone: "+91 90001 30006",
    hours: "6:00 AM – 9:00 PM",
    days: "Mon – Sun",
    rating: 4.8,
    tags: ["Yoga", "Breathwork", "Sound Healing"],
  },
];

const TYPE_ICON: Record<Business["type"], React.ElementType> = {
  spa:    Sparkles,
  gym:    Dumbbell,
  studio: Music2,
};

const TYPE_COLOR: Record<Business["type"], string> = {
  spa:    "bg-pink-50 text-pink-600 border-pink-100",
  gym:    "bg-blue-50 text-blue-600 border-blue-100",
  studio: "bg-green-50 text-green-600 border-green-100",
};

function StarRating({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-1 text-xs font-semibold text-amber-600">
      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
      {rating.toFixed(1)}
    </span>
  );
}

function BusinessCard({ b }: { b: Business }) {
  const Icon = TYPE_ICON[b.type];
  return (
    <div className="card p-5 space-y-3 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
      <div className="flex items-start justify-between gap-2">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${TYPE_COLOR[b.type]}`}>
          <Icon className="w-5 h-5" />
        </div>
        <StarRating rating={b.rating} />
      </div>

      <div>
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${TYPE_COLOR[b.type]}`}>
          {b.subtype}
        </span>
        <h3 className="font-bold text-gray-900 text-sm mt-2">{b.name}</h3>
        <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
          <MapPin className="w-3 h-3 shrink-0" /> {b.location}
        </p>
      </div>

      <div className="flex flex-wrap gap-1">
        {b.tags.map((tag) => (
          <span key={tag} className="text-xs bg-gray-50 text-gray-500 border border-gray-100 px-2 py-0.5 rounded-full">
            {tag}
          </span>
        ))}
      </div>

      <p className="text-xs text-gray-500 flex items-center gap-1.5">
        <Clock className="w-3.5 h-3.5 text-gray-400" />
        {b.hours} · {b.days}
      </p>

      <a
        href={`tel:${b.phone.replace(/\s/g, "")}`}
        className="flex items-center justify-center gap-2 w-full border border-gray-200 hover:border-purple-400 hover:text-purple-700 text-gray-600 text-xs font-semibold py-2 rounded-lg transition-colors"
      >
        <Phone className="w-3.5 h-3.5" /> {b.phone}
      </a>
    </div>
  );
}

export default function WellnessPage() {
  const searchParams = useSearchParams();
  const typeParam = searchParams.get("type") as WellnessType | null;
  const [active, setActive] = useState<WellnessType>(
    typeParam && ["spa", "gym", "studio"].includes(typeParam) ? typeParam : "spa"
  );

  useEffect(() => {
    const t = searchParams.get("type") as WellnessType | null;
    if (t && ["spa", "gym", "studio"].includes(t)) setActive(t);
  }, [searchParams]);

  const filtered = active === "all"
    ? BUSINESSES
    : BUSINESSES.filter((b) => b.type === active);

  return (
    <>
      {/* ── Hero ── */}
      <section className="bg-gradient-to-br from-purple-700 to-purple-500 text-white py-14 md:py-20">
        <SectionWrapper tight>
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-1.5 bg-purple-600 border border-purple-400 text-white text-xs font-bold px-3 py-1 rounded-full mb-4">
              <Sparkles className="w-3.5 h-3.5" /> Wellness Directory
            </span>
            <h1 className="text-3xl md:text-5xl font-extrabold mt-3 mb-4">
              Neopolis{" "}
              <span className="text-purple-200">Wellness</span>
            </h1>
            <p className="text-purple-100 text-lg mb-6">
              Spas, gyms, and fitness studios in and around the Neopolis district —
              book, call, or walk in.
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setActive("spa")}
                className="inline-flex items-center gap-2 bg-white text-purple-700 font-bold px-5 py-2.5 rounded-xl text-sm hover:bg-purple-50 transition-colors"
              >
                <Sparkles className="w-4 h-4" /> Massage Spas
              </button>
              <button
                onClick={() => setActive("gym")}
                className="inline-flex items-center gap-2 bg-purple-600 border border-purple-400 text-white font-semibold px-5 py-2.5 rounded-xl text-sm hover:bg-purple-500 transition-colors"
              >
                <Dumbbell className="w-4 h-4" /> Gyms
              </button>
              <button
                onClick={() => setActive("studio")}
                className="inline-flex items-center gap-2 bg-purple-600 border border-purple-400 text-white font-semibold px-5 py-2.5 rounded-xl text-sm hover:bg-purple-500 transition-colors"
              >
                <Music2 className="w-4 h-4" /> Studios
              </button>
            </div>
          </div>
        </SectionWrapper>
      </section>

      {/* ── Tabs ── */}
      <section className="bg-white border-b border-gray-100 sticky top-[calc(4rem+28px)] z-30">
        <SectionWrapper tight>
          <div className="flex gap-2 overflow-x-auto pb-0.5">
            {TABS.map((tab) => {
              const isActive = active === tab.id;
              const count = tab.id === "all"
                ? BUSINESSES.length
                : BUSINESSES.filter((b) => b.type === tab.id).length;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActive(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors border ${
                    isActive
                      ? "bg-purple-600 text-white border-purple-600"
                      : "border-gray-200 text-gray-600 hover:border-purple-300 hover:text-purple-700"
                  }`}
                >
                  <tab.icon className="w-3.5 h-3.5" />
                  {tab.label}
                  <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${
                    isActive ? "bg-purple-500 text-white" : "bg-gray-100 text-gray-500"
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </SectionWrapper>
      </section>

      {/* ── Business grid ── */}
      <section className="bg-gray-50">
        <SectionWrapper>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="section-heading !mb-0">
                {TABS.find((t) => t.id === active)?.label ?? "All Wellness"}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {filtered.length} businesses in Neopolis
              </p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((b) => (
              <BusinessCard key={b.name} b={b} />
            ))}
          </div>
        </SectionWrapper>
      </section>

      {/* ── Register CTA ── */}
      <section className="bg-purple-700 text-white">
        <SectionWrapper>
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
                List Your Wellness Business
              </h2>
              <p className="text-purple-200 mb-5">
                Get discovered by Neopolis residents looking for spas, gyms, and
                studios in the district.
              </p>
              <ul className="space-y-2 text-sm text-purple-100">
                {[
                  "Featured in search results",
                  "Phone & hours shown prominently",
                  "Reach 12,000+ district residents",
                  "Tag your specialities & classes",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-purple-300 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                href="/auth/register"
                className="inline-flex items-center gap-2 mt-6 bg-white text-purple-700 font-bold px-6 py-3 rounded-xl text-sm hover:bg-purple-50 transition-colors"
              >
                Register Now <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="bg-purple-800 rounded-2xl border border-purple-600 p-6">
              <LeadForm
                title="List Your Wellness Business"
                subtitle="We'll set up your profile with hours, location and contact."
                purpose="wellness-directory"
                dark
              />
            </div>
          </div>
        </SectionWrapper>
      </section>
    </>
  );
}
