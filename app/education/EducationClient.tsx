"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  GraduationCap, Baby, BookOpen,
  Phone, MapPin, Clock, CheckCircle, ArrowRight, Star,
} from "lucide-react";
import SectionWrapper from "@/components/SectionWrapper";
import LeadForm from "@/components/LeadForm";
import { getSubtypes } from "@/lib/businessDirectory";

type EduType = "schools" | "daycare" | "coaching";

interface Provider {
  name: string;
  type: EduType;
  subtype: string;
  location: string;
  phone: string;
  hours: string;
  days: string;
  tags: string[];
  rating?: number;
  affiliation?: string;
}

const TYPE_CONFIG: {
  id: EduType;
  label: string;
  icon: React.ElementType;
  color: string;
  taxKey: string;
}[] = [
  { id: "schools",  label: "Schools",            icon: GraduationCap, color: "bg-indigo-50 text-indigo-600", taxKey: "Schools" },
  { id: "daycare",  label: "Day Care",            icon: Baby,          color: "bg-pink-50 text-pink-600",    taxKey: "Day Care" },
  { id: "coaching", label: "Coaching & Tuition",  icon: BookOpen,      color: "bg-amber-50 text-amber-600",  taxKey: "Coaching & Tuition" },
];

const TYPE_MAP = Object.fromEntries(TYPE_CONFIG.map((t) => [t.id, t]));

const PROVIDERS: Provider[] = [
  // ── Schools ────────────────────────────────────────────────────────────────
  { name: "Neopolis International School",   type: "schools",  subtype: "IB (International Baccalaureate)", location: "Block E, Education Zone",          phone: "+91 88001 10001", hours: "8:00 AM – 3:30 PM", days: "Mon – Fri", rating: 4.8, affiliation: "IB World School", tags: ["PYP", "MYP", "Diploma Programme", "Sports Complex"] },
  { name: "Cambridge Global Academy",        type: "schools",  subtype: "Cambridge (IGCSE / A-Levels)",     location: "Tower 5, Education Hub",           phone: "+91 88001 10002", hours: "8:00 AM – 3:00 PM", days: "Mon – Fri", rating: 4.7, affiliation: "Cambridge Assessment",  tags: ["IGCSE", "AS & A Levels", "Science Labs", "Library"] },
  { name: "Neopolis CBSE School",            type: "schools",  subtype: "CBSE",                             location: "Sector 3, Residential Zone",       phone: "+91 88001 10003", hours: "8:30 AM – 3:30 PM", days: "Mon – Sat", rating: 4.6, affiliation: "CBSE Affiliated",      tags: ["Classes I–XII", "STEM Focus", "Smart Classes", "Activity Centre"] },
  { name: "Little Steps Montessori",         type: "schools",  subtype: "Montessori",                       location: "Ground Level, Block C",            phone: "+91 88001 10004", hours: "9:00 AM – 1:00 PM", days: "Mon – Fri", rating: 4.9, affiliation: "AMI Certified",         tags: ["Ages 2–6", "Child-Led Learning", "Nature Play", "Sensorial"] },
  { name: "Neopolis ICSE Academy",           type: "schools",  subtype: "ICSE",                             location: "Block F, Education Zone",          phone: "+91 88001 10005", hours: "8:00 AM – 3:30 PM", days: "Mon – Sat", rating: 4.6, affiliation: "CISCE Affiliated",     tags: ["Classes I–X", "English Medium", "Co-Curricular", "NCC"] },
  { name: "State Board High School",         type: "schools",  subtype: "State Board",                      location: "Sector 4, Community Area",         phone: "+91 88001 10006", hours: "9:00 AM – 4:00 PM", days: "Mon – Sat", rating: 4.4, affiliation: "Telangana State Board", tags: ["Telugu Medium", "English Medium", "Mid-Day Meal", "Scholarships"] },

  // ── Day Care ───────────────────────────────────────────────────────────────
  { name: "TinyTots Day Care Centre",        type: "daycare",  subtype: "Full-Day Care",                    location: "Level 1, Residential Block A",     phone: "+91 88001 20001", hours: "7:00 AM – 7:00 PM", days: "Mon – Sat", rating: 4.8, tags: ["Ages 6m–5yr", "CCTV", "Meals Included", "Trained Staff"] },
  { name: "Baby Bloom Nursery",              type: "daycare",  subtype: "Nursery",                          location: "Block C, Podium Level",            phone: "+91 88001 20002", hours: "8:00 AM – 1:00 PM", days: "Mon – Fri", rating: 4.7, tags: ["Ages 2–4", "Play-Based", "Storytelling", "Music & Art"] },
  { name: "Little Wonders Infant Care",      type: "daycare",  subtype: "Infant & Toddler Care",            location: "Block B, Residential Level",       phone: "+91 88001 20003", hours: "7:30 AM – 6:30 PM", days: "Mon – Sat", rating: 4.9, tags: ["Ages 3m–2yr", "Certified Caregivers", "Safe Environment", "Sleep Routine"] },
  { name: "AfterSchool Hub",                 type: "daycare",  subtype: "After-School Care",                location: "Community Centre, Block D",        phone: "+91 88001 20004", hours: "3:30 PM – 7:30 PM", days: "Mon – Fri", rating: 4.6, tags: ["Ages 5–12", "Homework Help", "Snacks", "Activities"] },
  { name: "Weekend Kids Club",               type: "daycare",  subtype: "Weekend Care",                     location: "Block A, Activity Area",           phone: "+91 88001 20005", hours: "9:00 AM – 6:00 PM", days: "Sat – Sun", rating: 4.5, tags: ["Ages 3–10", "Art & Craft", "Outdoor Play", "No Booking Needed"] },
  { name: "Half-Day Sunshine Centre",        type: "daycare",  subtype: "Half-Day Care",                    location: "Block E, Ground Level",            phone: "+91 88001 20006", hours: "8:00 AM – 1:00 PM", days: "Mon – Sat", rating: 4.7, tags: ["Ages 1–4", "Montessori Inspired", "Nutritious Snacks"] },

  // ── Coaching & Tuition ─────────────────────────────────────────────────────
  { name: "Neopolis Tuition Academy",        type: "coaching", subtype: "Academic Tuition",                 location: "Level 2, Commercial Block B",      phone: "+91 88001 30001", hours: "4:00 PM – 8:00 PM", days: "Mon – Sat", rating: 4.7, tags: ["Classes VI–XII", "All Boards", "Maths & Science", "Small Batches"] },
  { name: "IIT-JEE & NEET Prep Centre",      type: "coaching", subtype: "Competitive Exam Prep",            location: "Block F, Level 3",                 phone: "+91 88001 30002", hours: "6:00 AM – 9:00 PM", days: "Mon – Sun", rating: 4.8, tags: ["JEE Main & Advanced", "NEET", "UPSC", "Mock Tests"] },
  { name: "LinguaPlus Language Institute",   type: "coaching", subtype: "Language Classes",                 location: "Block C, Level 1",                 phone: "+91 88001 30003", hours: "7:00 AM – 8:00 PM", days: "Mon – Sat", rating: 4.6, tags: ["English", "German", "French", "IELTS / TOEFL"] },
  { name: "SkillUp Neopolis",                type: "coaching", subtype: "Skill Development",                location: "Block B, Innovation Hub",          phone: "+91 88001 30004", hours: "9:00 AM – 7:00 PM", days: "Mon – Sat", rating: 4.5, tags: ["Coding", "Design", "Digital Marketing", "Public Speaking"] },
  { name: "Neopolis Music Academy",          type: "coaching", subtype: "Music Academy",                    location: "Arts Centre, Block D",             phone: "+91 88001 30005", hours: "10:00 AM – 7:00 PM",days: "Mon – Sun", rating: 4.9, tags: ["Piano", "Guitar", "Carnatic Vocals", "Western Vocals", "Tabla"] },
  { name: "Canvas Art Studio",               type: "coaching", subtype: "Art Classes",                      location: "Level 1, Arts Centre",             phone: "+91 88001 30006", hours: "10:00 AM – 6:00 PM",days: "Tue – Sun", rating: 4.8, tags: ["Sketching", "Watercolour", "Oil Painting", "Pottery"] },
  { name: "Champions Sports Academy",        type: "coaching", subtype: "Sports Coaching",                  location: "Sports Zone, Block G",             phone: "+91 88001 30007", hours: "6:00 AM – 8:00 PM", days: "Mon – Sun", rating: 4.7, tags: ["Cricket", "Football", "Badminton", "Swimming", "Tennis"] },
];

function StarRating({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-1 text-xs font-semibold text-amber-600">
      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
      {rating.toFixed(1)}
    </span>
  );
}

function ProviderCard({ p }: { p: Provider }) {
  const cfg = TYPE_MAP[p.type];
  const Icon = cfg.icon;
  return (
    <div className="card p-5 space-y-3 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
      <div className="flex items-start justify-between gap-2">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${cfg.color}`}>
          <Icon className="w-5 h-5" />
        </div>
        {p.rating && <StarRating rating={p.rating} />}
      </div>
      <div>
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${cfg.color}`}>{p.subtype}</span>
        <h3 className="font-bold text-gray-900 text-sm mt-2 leading-snug">{p.name}</h3>
        {p.affiliation && (
          <p className="text-xs text-gray-400 mt-0.5">{p.affiliation}</p>
        )}
        <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
          <MapPin className="w-3 h-3 shrink-0" /> {p.location}
        </p>
      </div>
      <div className="flex flex-wrap gap-1">
        {p.tags.map((tag) => (
          <span key={tag} className="text-xs bg-gray-50 text-gray-500 border border-gray-100 px-2 py-0.5 rounded-full">
            {tag}
          </span>
        ))}
      </div>
      <p className="text-xs text-gray-500 flex items-center gap-1.5">
        <Clock className="w-3.5 h-3.5 text-gray-400" /> {p.hours} · {p.days}
      </p>
      <a
        href={`tel:${p.phone.replace(/\s/g, "")}`}
        className="flex items-center justify-center gap-2 w-full border border-gray-200 hover:border-gray-400 text-gray-600 hover:text-gray-900 text-xs font-semibold py-2 rounded-lg transition-colors"
      >
        <Phone className="w-3.5 h-3.5" /> {p.phone}
      </a>
    </div>
  );
}

function EducationInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const VALID: EduType[] = ["schools", "daycare", "coaching"];
  const typeParam = searchParams.get("type") as EduType | null;

  const [active, setActive] = useState<EduType>(
    typeParam && VALID.includes(typeParam) ? typeParam : "schools"
  );
  const [subFilter, setSubFilter] = useState<string>("all");

  useEffect(() => {
    const t = searchParams.get("type") as EduType | null;
    if (t && VALID.includes(t)) { setActive(t); setSubFilter("all"); }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const handleTabChange = (t: EduType) => {
    setActive(t);
    setSubFilter("all");
    router.replace(`/education?type=${t}`, { scroll: false });
  };

  const cfg = TYPE_MAP[active];
  const subtypes = getSubtypes("Education", cfg.taxKey);
  const filtered = PROVIDERS.filter(
    (p) => p.type === active && (subFilter === "all" || p.subtype === subFilter)
  );

  return (
    <>
      {/* ── Hero ── */}
      <section className="bg-gradient-to-br from-indigo-800 to-indigo-600 text-white py-14 md:py-20">
        <SectionWrapper tight>
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-1.5 bg-indigo-700 border border-indigo-500 text-white text-xs font-bold px-3 py-1 rounded-full mb-4">
              Education Directory
            </span>
            <h1 className="text-3xl md:text-5xl font-extrabold mt-3 mb-4">
              Neopolis <span className="text-indigo-200">Education Directory</span>
            </h1>
            <p className="text-indigo-100 text-lg mb-6">
              Schools, day care centres, and coaching academies — everything your child needs, all within the district.
            </p>
            <div className="flex flex-wrap gap-2">
              {TYPE_CONFIG.map((t) => (
                <button
                  key={t.id}
                  onClick={() => handleTabChange(t.id)}
                  className={`inline-flex items-center gap-2 font-semibold px-4 py-2.5 rounded-xl text-sm transition-colors ${
                    active === t.id
                      ? "bg-white text-gray-900"
                      : "bg-indigo-700 border border-indigo-500 text-indigo-100 hover:bg-indigo-600"
                  }`}
                >
                  <t.icon className="w-4 h-4" /> {t.label}
                </button>
              ))}
            </div>
          </div>
        </SectionWrapper>
      </section>

      {/* ── Sticky type tabs ── */}
      <section className="bg-white border-b border-gray-100 sticky top-[calc(4rem+28px)] z-30">
        <SectionWrapper tight>
          <div className="flex gap-2 overflow-x-auto pb-0.5">
            {TYPE_CONFIG.map((t) => {
              const count = PROVIDERS.filter((p) => p.type === t.id).length;
              return (
                <button
                  key={t.id}
                  onClick={() => handleTabChange(t.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors border ${
                    active === t.id
                      ? "bg-gray-900 text-white border-gray-900"
                      : "border-gray-200 text-gray-600 hover:border-gray-400 hover:text-gray-900"
                  }`}
                >
                  <t.icon className="w-3.5 h-3.5" />
                  {t.label}
                  <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${
                    active === t.id ? "bg-gray-700 text-white" : "bg-gray-100 text-gray-500"
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </SectionWrapper>
      </section>

      {/* ── Subtype capsule filters ── */}
      <section className="bg-gray-50 border-b border-gray-100">
        <SectionWrapper tight>
          <div className="flex gap-2 overflow-x-auto py-3">
            <button
              onClick={() => setSubFilter("all")}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap border transition-colors ${
                subFilter === "all"
                  ? `${cfg.color} border-current`
                  : "border-gray-200 text-gray-500 hover:border-gray-400"
              }`}
            >
              All
            </button>
            {subtypes.map((st) => (
              <button
                key={st}
                onClick={() => setSubFilter(st)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap border transition-colors ${
                  subFilter === st
                    ? `${cfg.color} border-current`
                    : "border-gray-200 text-gray-500 hover:border-gray-400"
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </SectionWrapper>
      </section>

      {/* ── Provider grid ── */}
      <section className="bg-gray-50 min-h-64">
        <SectionWrapper>
          <div className="flex items-center gap-3 mb-6">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${cfg.color}`}>
              <cfg.icon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="section-heading !mb-0">
                {subFilter === "all" ? cfg.label : subFilter}
              </h2>
              <p className="text-sm text-gray-500 mt-0.5">
                {filtered.length} listed in Neopolis
              </p>
            </div>
          </div>

          {filtered.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map((p) => <ProviderCard key={p.name} p={p} />)}
            </div>
          ) : (
            <div className="text-center py-16 text-gray-400">
              <p className="text-sm">No providers listed for this category yet.</p>
              <p className="text-xs mt-1">Register your institution below to get listed.</p>
            </div>
          )}
        </SectionWrapper>
      </section>

      {/* ── CTA ── */}
      <section className="bg-indigo-800 text-white">
        <SectionWrapper>
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
                Register Your Institution
              </h2>
              <p className="text-indigo-200 mb-5">
                Get listed in the Neopolis Education Directory. Parents searching for schools, day care, and coaching find you here first.
              </p>
              <ul className="space-y-2 text-sm text-indigo-100">
                {[
                  "Board affiliation & curriculum shown",
                  "Hours, location & contact visible",
                  "Filterable by board and speciality",
                  "Reach 12,000+ district families",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-indigo-300 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                href="/auth/register"
                className="inline-flex items-center gap-2 mt-6 bg-white text-indigo-800 font-bold px-6 py-3 rounded-xl text-sm hover:bg-indigo-50 transition-colors"
              >
                Register Now <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="bg-indigo-900 rounded-2xl border border-indigo-700 p-6">
              <LeadForm
                title="List Your Institution"
                subtitle="Tell us about your school, day care, or academy."
                purpose="education-directory"
                dark
              />
            </div>
          </div>
        </SectionWrapper>
      </section>
    </>
  );
}

export default function EducationClient() {
  return (
    <Suspense>
      <EducationInner />
    </Suspense>
  );
}
