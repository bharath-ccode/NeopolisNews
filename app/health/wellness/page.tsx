"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Sparkles,
  Dumbbell,
  Music2,
  UserRound,
  MapPin,
  Phone,
  Clock,
  Star,
  ArrowRight,
  CheckCircle,
  Calendar,
  Users,
  User,
  IndianRupee,
} from "lucide-react";
import SectionWrapper from "@/components/SectionWrapper";
import LeadForm from "@/components/LeadForm";

type WellnessType = "spa" | "gym" | "studio" | "trainer";

const TABS: { id: WellnessType; label: string; icon: React.ElementType; color: string }[] = [
  { id: "spa",     label: "Massage Spa", icon: Sparkles,  color: "bg-pink-50 text-pink-600"     },
  { id: "gym",     label: "Gym",         icon: Dumbbell,  color: "bg-blue-50 text-blue-600"     },
  { id: "studio",  label: "Studio",      icon: Music2,    color: "bg-green-50 text-green-600"   },
  { id: "trainer", label: "Trainers",    icon: UserRound, color: "bg-amber-50 text-amber-600"   },
];

// ─── Business (Spa / Gym / Studio) ───────────────────────────────────────────

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
  // Massage Spa
  { name: "Serene Spa & Wellness",   type: "spa", subtype: "Massage Spa", location: "Level 2, Neopolis Grand Mall",        phone: "+91 90001 10001", hours: "10:00 AM – 9:00 PM", days: "Mon – Sun", rating: 4.8, tags: ["Swedish Massage", "Aromatherapy", "Couples Spa"]       },
  { name: "O2 Luxury Spa",           type: "spa", subtype: "Massage Spa", location: "Tower 1, Commercial Podium",           phone: "+91 90001 10002", hours: "9:00 AM – 10:00 PM",  days: "Mon – Sun", rating: 4.7, tags: ["Deep Tissue", "Hot Stone", "Facial Treatments"]         },
  { name: "Bliss Ayurvedic Spa",     type: "spa", subtype: "Massage Spa", location: "Healthcare Strip, Block D",            phone: "+91 90001 10003", hours: "8:00 AM – 8:00 PM",  days: "Mon – Sat", rating: 4.9, tags: ["Ayurvedic", "Abhyanga", "Shirodhara"]                   },
  { name: "Thai Retreat Spa",        type: "spa", subtype: "Massage Spa", location: "Ground Floor, Lifestyle Hub",          phone: "+91 90001 10004", hours: "10:00 AM – 9:00 PM", days: "Mon – Sun", rating: 4.6, tags: ["Thai Massage", "Reflexology", "Herbal Steam"]            },
  { name: "Zen Garden Wellness",     type: "spa", subtype: "Massage Spa", location: "Neopolis Residents Club",              phone: "+91 90001 10005", hours: "7:00 AM – 9:00 PM",  days: "Mon – Sun", rating: 4.8, tags: ["Relaxation", "Body Wraps", "Hydrotherapy"]               },
  { name: "Heal & Glow Spa Studio",  type: "spa", subtype: "Massage Spa", location: "Block E, Shop 2, Residential Strip",   phone: "+91 90001 10006", hours: "9:00 AM – 8:00 PM",  days: "Tue – Sun", rating: 4.5, tags: ["Express Massage", "Skin Glow", "Foot Spa"]               },
  // Gym
  { name: "Anytime Fitness",         type: "gym", subtype: "Gym", location: "Tower 2, Commercial Podium",          phone: "+91 90001 20001", hours: "24 hours",            days: "All days",  rating: 4.6, tags: ["24/7 Access", "Cardio Zone", "Free Weights"]             },
  { name: "Cult.fit Neopolis",       type: "gym", subtype: "Gym", location: "Level 1, Lifestyle Hub",              phone: "+91 90001 20002", hours: "5:30 AM – 10:00 PM", days: "Mon – Sun", rating: 4.7, tags: ["Group Classes", "HIIT", "Boxing"]                        },
  { name: "Gold's Gym",              type: "gym", subtype: "Gym", location: "Neopolis Grand Mall, Level 3",        phone: "+91 90001 20003", hours: "5:00 AM – 11:00 PM", days: "Mon – Sun", rating: 4.5, tags: ["Weight Training", "Cardio", "Personal Training"]         },
  { name: "BodyFit 24/7",            type: "gym", subtype: "Gym", location: "Commercial Block A, Ground Floor",    phone: "+91 90001 20004", hours: "24 hours",            days: "All days",  rating: 4.4, tags: ["Strength Training", "Functional Fitness", "Steam Room"]  },
  { name: "ProZone Fitness",         type: "gym", subtype: "Gym", location: "Block C, Ground Floor",               phone: "+91 90001 20005", hours: "5:00 AM – 10:00 PM", days: "Mon – Sat", rating: 4.6, tags: ["CrossFit Style", "Nutrition Coaching", "Locker Rooms"]  },
  { name: "IronWorks Strength",      type: "gym", subtype: "Gym", location: "Block B Podium Level",                phone: "+91 90001 20006", hours: "6:00 AM – 10:00 PM", days: "Mon – Sun", rating: 4.8, tags: ["Powerlifting", "Olympic Lifting", "1-on-1 Training"]     },
  // Studio
  { name: "Yoga Tree Studio",        type: "studio", subtype: "Studio", location: "Tower 3, Podium Level",                 phone: "+91 90001 30001", hours: "6:00 AM – 9:00 PM", days: "Mon – Sun", rating: 4.9, tags: ["Hatha Yoga", "Yin Yoga", "Meditation"]                  },
  { name: "Pilates Lab",             type: "studio", subtype: "Studio", location: "Commercial Strip, Block F",              phone: "+91 90001 30002", hours: "7:00 AM – 8:00 PM", days: "Mon – Sat", rating: 4.8, tags: ["Reformer Pilates", "Mat Pilates", "Pre/Post Natal"]     },
  { name: "CrossFit Neopolis",       type: "studio", subtype: "Studio", location: "Zone 2, Industrial Block",               phone: "+91 90001 30003", hours: "5:30 AM – 9:00 PM", days: "Mon – Sat", rating: 4.7, tags: ["CrossFit WODs", "Olympic Lifting", "Endurance"]         },
  { name: "Dance Central",           type: "studio", subtype: "Studio", location: "Level 2, Lifestyle Hub",                 phone: "+91 90001 30004", hours: "10:00 AM – 8:00 PM",days: "Mon – Sun", rating: 4.6, tags: ["Bollywood", "Contemporary", "Kids Classes"]             },
  { name: "Zumba & Dance Studio",    type: "studio", subtype: "Studio", location: "Residential Block D, Amenity Floor",    phone: "+91 90001 30005", hours: "7:00 AM – 7:00 PM", days: "Mon – Sat", rating: 4.5, tags: ["Zumba", "Aerobics", "Salsa"]                            },
  { name: "MindBody Wellness Studio",type: "studio", subtype: "Studio", location: "Healthcare Zone, Block D",               phone: "+91 90001 30006", hours: "6:00 AM – 9:00 PM", days: "Mon – Sun", rating: 4.8, tags: ["Yoga", "Breathwork", "Sound Healing"]                   },
];

// ─── Trainers ─────────────────────────────────────────────────────────────────

type TrainerSpeciality = "Fitness" | "Yoga" | "Zumba";
type ClassMode = "Private" | "Group" | "Both";

interface Trainer {
  name: string;
  speciality: TrainerSpeciality;
  experience: string;
  venues: string[];
  schedule: string;
  time: string;
  classMode: ClassMode;
  monthlyRate: string;
  phone: string;
  rating: number;
  about: string;
}

const TRAINERS: Trainer[] = [
  {
    name: "Ravi Kumar",
    speciality: "Fitness",
    experience: "9 years",
    venues: ["Neopolis Clubhouse Gym", "Block A Community Gym"],
    schedule: "Mon – Fri",
    time: "5:30 AM – 7:30 AM",
    classMode: "Both",
    monthlyRate: "₹4,500",
    phone: "+91 90002 10001",
    rating: 4.9,
    about: "Certified personal trainer specialising in strength, HIIT and functional fitness. Conducts morning batch classes and 1-on-1 sessions.",
  },
  {
    name: "Arjun Mehta",
    speciality: "Fitness",
    experience: "6 years",
    venues: ["IronWorks Gym, Block B", "Block C Community Hall"],
    schedule: "Mon – Fri",
    time: "7:00 AM – 9:00 AM",
    classMode: "Private",
    monthlyRate: "₹5,000",
    phone: "+91 90002 10002",
    rating: 4.7,
    about: "Specialises in weight training, body transformation, and sports conditioning. Customised nutrition plans included with monthly package.",
  },
  {
    name: "Priya Sharma",
    speciality: "Yoga",
    experience: "11 years",
    venues: ["Tower 3 Clubhouse Studio", "Neopolis Residents Club"],
    schedule: "Mon – Fri",
    time: "6:00 AM – 7:30 AM",
    classMode: "Group",
    monthlyRate: "₹3,000",
    phone: "+91 90002 20001",
    rating: 4.9,
    about: "RYT-500 certified yoga teacher offering Hatha, Vinyasa and meditation. Morning group batches limited to 10 participants for personalised attention.",
  },
  {
    name: "Anita Reddy",
    speciality: "Yoga",
    experience: "8 years",
    venues: ["Yoga Tree Studio, Tower 3", "Block D Amenity Studio"],
    schedule: "Mon – Sat",
    time: "7:00 AM – 8:30 AM",
    classMode: "Both",
    monthlyRate: "₹3,500",
    phone: "+91 90002 20002",
    rating: 4.8,
    about: "Specialist in Yin Yoga, prenatal yoga and therapeutic yoga for back & joint health. Private sessions tailored to individual needs.",
  },
  {
    name: "Deepa Nair",
    speciality: "Zumba",
    experience: "7 years",
    venues: ["Clubhouse Dance Studio", "Lifestyle Hub Level 2"],
    schedule: "Mon – Fri",
    time: "7:00 AM – 8:00 AM",
    classMode: "Group",
    monthlyRate: "₹2,500",
    phone: "+91 90002 30001",
    rating: 4.8,
    about: "Licensed Zumba instructor running high-energy morning group classes. Combines Zumba with Bollywood and Latin dance. Great for all fitness levels.",
  },
  {
    name: "Sneha Kapoor",
    speciality: "Zumba",
    experience: "5 years",
    venues: ["Block D Community Hall", "Block F Amenity Studio"],
    schedule: "Mon – Sat",
    time: "6:30 AM – 7:30 AM",
    classMode: "Group",
    monthlyRate: "₹2,800",
    phone: "+91 90002 30002",
    rating: 4.6,
    about: "Energetic Zumba & aerobics instructor. Focuses on fun, inclusive classes combining cardio dance and toning. Kids and adult batches available.",
  },
];

// ─── Colours & icons ──────────────────────────────────────────────────────────

const BUSINESS_ICON: Record<Business["type"], React.ElementType> = {
  spa:    Sparkles,
  gym:    Dumbbell,
  studio: Music2,
};

const BUSINESS_COLOR: Record<Business["type"], string> = {
  spa:    "bg-pink-50 text-pink-600 border-pink-100",
  gym:    "bg-blue-50 text-blue-600 border-blue-100",
  studio: "bg-green-50 text-green-600 border-green-100",
};

const SPECIALITY_COLOR: Record<TrainerSpeciality, string> = {
  Fitness: "bg-blue-50 text-blue-700 border-blue-100",
  Yoga:    "bg-green-50 text-green-700 border-green-100",
  Zumba:   "bg-pink-50 text-pink-700 border-pink-100",
};

const SPECIALITY_AVATAR: Record<TrainerSpeciality, string> = {
  Fitness: "bg-blue-600",
  Yoga:    "bg-green-600",
  Zumba:   "bg-pink-500",
};

const CLASS_MODE_COLOR: Record<ClassMode, string> = {
  Private: "bg-amber-50 text-amber-700 border-amber-100",
  Group:   "bg-purple-50 text-purple-700 border-purple-100",
  Both:    "bg-teal-50 text-teal-700 border-teal-100",
};

// ─── Cards ────────────────────────────────────────────────────────────────────

function StarRating({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-1 text-xs font-semibold text-amber-600">
      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
      {rating.toFixed(1)}
    </span>
  );
}

function BusinessCard({ b }: { b: Business }) {
  const Icon = BUSINESS_ICON[b.type];
  return (
    <div className="card p-5 space-y-3 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
      <div className="flex items-start justify-between gap-2">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${BUSINESS_COLOR[b.type]}`}>
          <Icon className="w-5 h-5" />
        </div>
        <StarRating rating={b.rating} />
      </div>
      <div>
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${BUSINESS_COLOR[b.type]}`}>
          {b.subtype}
        </span>
        <h3 className="font-bold text-gray-900 text-sm mt-2">{b.name}</h3>
        <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
          <MapPin className="w-3 h-3 shrink-0" /> {b.location}
        </p>
      </div>
      <div className="flex flex-wrap gap-1">
        {b.tags.map((tag) => (
          <span key={tag} className="text-xs bg-gray-50 text-gray-500 border border-gray-100 px-2 py-0.5 rounded-full">{tag}</span>
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

function TrainerCard({ t }: { t: Trainer }) {
  const initials = t.name.split(" ").map((n) => n[0]).join("").slice(0, 2);
  return (
    <div className="card p-5 space-y-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className={`w-12 h-12 rounded-full ${SPECIALITY_AVATAR[t.speciality]} flex items-center justify-center text-white font-bold text-sm shrink-0`}>
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-1">
            <h3 className="font-bold text-gray-900 text-sm leading-snug">{t.name}</h3>
            <StarRating rating={t.rating} />
          </div>
          <div className="flex flex-wrap gap-1.5 mt-1.5">
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${SPECIALITY_COLOR[t.speciality]}`}>
              {t.speciality} Trainer
            </span>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${CLASS_MODE_COLOR[t.classMode]}`}>
              {t.classMode === "Both" ? (
                <span className="flex items-center gap-1"><Users className="w-3 h-3" /> Private & Group</span>
              ) : t.classMode === "Private" ? (
                <span className="flex items-center gap-1"><User className="w-3 h-3" /> Private</span>
              ) : (
                <span className="flex items-center gap-1"><Users className="w-3 h-3" /> Group</span>
              )}
            </span>
          </div>
        </div>
      </div>

      {/* About */}
      <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">{t.about}</p>

      {/* Schedule & venues */}
      <div className="space-y-2 text-xs text-gray-600">
        <div className="flex items-center gap-2">
          <Calendar className="w-3.5 h-3.5 text-amber-500 shrink-0" />
          <span>{t.schedule} · <span className="font-semibold">{t.time}</span></span>
        </div>
        <div className="flex items-start gap-2">
          <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" />
          <span>{t.venues.join(" · ")}</span>
        </div>
      </div>

      {/* Footer row */}
      <div className="flex items-center justify-between pt-1 border-t border-gray-100">
        <div className="flex items-center gap-1 text-sm font-bold text-amber-700">
          <IndianRupee className="w-3.5 h-3.5" />
          <span>{t.monthlyRate.replace("₹", "")}<span className="text-xs text-gray-400 font-normal">/mo</span></span>
        </div>
        <span className="text-xs text-gray-400">{t.experience} exp.</span>
      </div>

      <a
        href={`tel:${t.phone.replace(/\s/g, "")}`}
        className="flex items-center justify-center gap-2 w-full border border-gray-200 hover:border-amber-400 hover:text-amber-700 text-gray-600 text-xs font-semibold py-2 rounded-lg transition-colors"
      >
        <Phone className="w-3.5 h-3.5" /> {t.phone}
      </a>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function WellnessPage() {
  const searchParams = useSearchParams();
  const typeParam = searchParams.get("type") as WellnessType | null;
  const VALID_TYPES: WellnessType[] = ["spa", "gym", "studio", "trainer"];

  const [active, setActive] = useState<WellnessType>(
    typeParam && VALID_TYPES.includes(typeParam) ? typeParam : "spa"
  );

  useEffect(() => {
    const t = searchParams.get("type") as WellnessType | null;
    if (t && VALID_TYPES.includes(t)) setActive(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const filteredBusinesses = BUSINESSES.filter((b) => b.type === (active as Business["type"]));
  const isTrainer = active === "trainer";

  const count = isTrainer
    ? TRAINERS.length
    : filteredBusinesses.length;

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
              Spas, gyms, studios and personal trainers in and around the Neopolis
              district — call, book, or hire monthly.
            </p>
            <div className="flex flex-wrap gap-3">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActive(tab.id)}
                  className={`inline-flex items-center gap-2 font-semibold px-4 py-2.5 rounded-xl text-sm transition-colors ${
                    active === tab.id
                      ? "bg-white text-purple-700 font-bold"
                      : "bg-purple-600 border border-purple-400 text-white hover:bg-purple-500"
                  }`}
                >
                  <tab.icon className="w-4 h-4" /> {tab.label}
                </button>
              ))}
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
              const c = tab.id === "trainer"
                ? TRAINERS.length
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
                    {c}
                  </span>
                </button>
              );
            })}
          </div>
        </SectionWrapper>
      </section>

      {/* ── Grid ── */}
      <section className="bg-gray-50">
        <SectionWrapper>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="section-heading !mb-0">
                {TABS.find((t) => t.id === active)?.label}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {count} {isTrainer ? "trainers" : "businesses"} in Neopolis
              </p>
            </div>
            {isTrainer && (
              <div className="flex gap-2 text-xs text-gray-500">
                <span className="flex items-center gap-1.5 bg-blue-50 text-blue-700 border border-blue-100 px-2.5 py-1 rounded-full font-medium">Fitness</span>
                <span className="flex items-center gap-1.5 bg-green-50 text-green-700 border border-green-100 px-2.5 py-1 rounded-full font-medium">Yoga</span>
                <span className="flex items-center gap-1.5 bg-pink-50 text-pink-700 border border-pink-100 px-2.5 py-1 rounded-full font-medium">Zumba</span>
              </div>
            )}
          </div>

          {isTrainer ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {TRAINERS.map((t) => <TrainerCard key={t.name} t={t} />)}
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredBusinesses.map((b) => <BusinessCard key={b.name} b={b} />)}
            </div>
          )}
        </SectionWrapper>
      </section>

      {/* ── Register CTA ── */}
      <section className="bg-purple-700 text-white">
        <SectionWrapper>
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
                {isTrainer ? "Register as a Trainer" : "List Your Wellness Business"}
              </h2>
              <p className="text-purple-200 mb-5">
                {isTrainer
                  ? "Get hired by Neopolis residents. Share your schedule, speciality and monthly rate."
                  : "Get discovered by Neopolis residents looking for spas, gyms, and studios in the district."}
              </p>
              <ul className="space-y-2 text-sm text-purple-100">
                {(isTrainer
                  ? ["Profile with schedule & rates", "Reach residents directly", "Private & group enquiries", "Verified trainer badge"]
                  : ["Featured in search results", "Phone & hours shown prominently", "Reach 12,000+ district residents", "Tag your specialities & classes"]
                ).map((item) => (
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
                title={isTrainer ? "Register as a Trainer" : "List Your Wellness Business"}
                subtitle={isTrainer
                  ? "Tell us your speciality, schedule and preferred venues."
                  : "We'll set up your profile with hours, location and contact."}
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
