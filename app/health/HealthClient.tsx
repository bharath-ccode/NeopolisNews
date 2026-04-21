"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Hospital, Ambulance, Stethoscope, Pill, FlaskConical,
  PhoneCall, Phone, MapPin, Clock, CheckCircle, ArrowRight, Sparkles,
} from "lucide-react";
import SectionWrapper from "@/components/SectionWrapper";
import LeadForm from "@/components/LeadForm";
import { getSubtypes } from "@/lib/businessDirectory";

type HealthType = "hospitals" | "ambulance" | "clinics" | "diagnostics" | "pharmacies";

interface Provider {
  name: string;
  type: HealthType;
  subtype: string;
  location: string;
  phone: string;
  emergency?: string;
  hours: string;
  days: string;
  tags: string[];
  open24?: boolean;
}

const TYPE_CONFIG: {
  id: HealthType;
  label: string;
  icon: React.ElementType;
  color: string;
  taxKey: string;
  emergencyColor: string;
}[] = [
  { id: "hospitals",   label: "Hospitals",   icon: Hospital,     color: "bg-red-50 text-red-600",     taxKey: "Hospital",           emergencyColor: "bg-red-600 hover:bg-red-700" },
  { id: "ambulance",   label: "Ambulance",   icon: Ambulance,    color: "bg-orange-50 text-orange-600",taxKey: "Ambulance Services", emergencyColor: "bg-orange-500 hover:bg-orange-600" },
  { id: "clinics",     label: "Clinics",     icon: Stethoscope,  color: "bg-cyan-50 text-cyan-600",   taxKey: "Clinics",            emergencyColor: "" },
  { id: "diagnostics", label: "Diagnostics", icon: FlaskConical, color: "bg-blue-50 text-blue-600",   taxKey: "Diagnostics",        emergencyColor: "" },
  { id: "pharmacies",  label: "Pharmacies",  icon: Pill,         color: "bg-teal-50 text-teal-600",   taxKey: "Pharmacies",         emergencyColor: "" },
];

const TYPE_MAP = Object.fromEntries(TYPE_CONFIG.map((t) => [t.id, t]));

const PROVIDERS: Provider[] = [
  // ── Hospitals ──────────────────────────────────────────────────────────────
  { name: "Neopolis General Hospital",      type: "hospitals",   subtype: "Multi-Speciality Hospital",          location: "Block A, Healthcare Zone",          phone: "+91 99001 00002", emergency: "+91 99001 00001", hours: "24 / 7",             days: "All days",  tags: ["Trauma & Emergency", "Cardiology", "Orthopaedics", "ICU"] },
  { name: "Apex Multi-Speciality Hospital", type: "hospitals",   subtype: "Multi-Speciality Hospital",          location: "Tower 3, Neopolis Health Hub",       phone: "+91 99001 00012", emergency: "+91 99001 00011", hours: "24 / 7",             days: "All days",  tags: ["Neurology", "Oncology", "Paediatrics", "Maternity"] },
  { name: "HeartCare Cardiac Centre",       type: "hospitals",   subtype: "Single Speciality Hospital",         location: "Level 2, Health Strip Block D",      phone: "+91 99001 00013", emergency: "+91 99001 00014", hours: "24 / 7",             days: "All days",  tags: ["Cardiology", "Cardiac Surgery", "Cath Lab"] },

  // ── Ambulance ──────────────────────────────────────────────────────────────
  { name: "Neopolis Rapid Ambulance",       type: "ambulance",   subtype: "ICU Ambulance",                      location: "District Central Station",          phone: "+91 99001 00022", emergency: "+91 99001 00021", hours: "24 / 7",             days: "All days",  tags: ["Advanced Life Support", "ICU Transport", "Neonatal Transfer"] },
  { name: "Swift Medics Ambulance",         type: "ambulance",   subtype: "Patient Transport",                  location: "Gate 2, Neopolis South",            phone: "+91 99001 00032", emergency: "+91 99001 00031", hours: "24 / 7",             days: "All days",  tags: ["Basic Life Support", "Non-Emergency Transport"] },
  { name: "AirMed Neopolis",                type: "ambulance",   subtype: "Air Ambulance",                      location: "Neopolis Helipad, Roof Block A",     phone: "+91 99001 00033", emergency: "+91 99001 00034", hours: "24 / 7",             days: "All days",  tags: ["Air Transport", "Critical Care", "Inter-City Transfer"] },

  // ── Clinics ────────────────────────────────────────────────────────────────
  { name: "Neopolis Family Clinic",         type: "clinics",     subtype: "General Practice & Family Medicine", location: "Ground Floor, Residential Block C", phone: "+91 99001 00041",                               hours: "8:00 AM – 9:00 PM",  days: "Mon – Sat", tags: ["Family Medicine", "Preventive Care", "Minor Surgery"] },
  { name: "Smile Dental Studio",            type: "clinics",     subtype: "Dental & Orthodontics",              location: "Level 1, Commercial Block B",        phone: "+91 99001 00051",                               hours: "10:00 AM – 7:00 PM", days: "Mon – Sat", tags: ["Orthodontics", "Root Canal", "Implants"] },
  { name: "VisionCare Eye Centre",          type: "clinics",     subtype: "Ophthalmology",                      location: "Block D, Health Strip",              phone: "+91 99001 00061",                               hours: "9:00 AM – 6:00 PM",  days: "Mon – Sun", tags: ["LASIK", "Cataract", "Retina", "Glaucoma"] },
  { name: "PhysioPlus Rehabilitation",      type: "clinics",     subtype: "Physiotherapy & Rehabilitation",     location: "Podium Level, Tower 2",              phone: "+91 99001 00071",                               hours: "7:00 AM – 8:00 PM",  days: "Mon – Sat", tags: ["Sports Rehab", "Post-Surgery", "Spine Care"] },
  { name: "DermaCare Skin Clinic",          type: "clinics",     subtype: "Dermatology & Cosmetology",          location: "Block B, Retail Level",              phone: "+91 99001 00081",                               hours: "10:00 AM – 7:00 PM", days: "Tue – Sun", tags: ["Acne", "Anti-Ageing", "Laser", "PRP"] },
  { name: "KidsCare Paediatrics",           type: "clinics",     subtype: "Paediatrics & Child Care",           location: "Block C, Level 1",                   phone: "+91 99001 00091",                               hours: "9:00 AM – 8:00 PM",  days: "Mon – Sat", tags: ["Newborn Care", "Vaccinations", "Growth Monitoring"] },

  // ── Diagnostics ────────────────────────────────────────────────────────────
  { name: "NeoPath Diagnostics",            type: "diagnostics", subtype: "Blood Tests & Pathology",            location: "Ground Floor, Health Hub",           phone: "+91 99001 00101",                               hours: "7:00 AM – 9:00 PM",  days: "Mon – Sun", tags: ["CBC", "Lipid Profile", "Thyroid", "Diabetes Panel"] },
  { name: "ScanCentre Radiology",           type: "diagnostics", subtype: "Imaging & Radiology",                location: "Block A, Level 1",                   phone: "+91 99001 00111",                               hours: "8:00 AM – 8:00 PM",  days: "Mon – Sat", tags: ["MRI", "CT Scan", "X-Ray", "Ultrasound"] },
  { name: "HealthCheck Plus",               type: "diagnostics", subtype: "Full Body Checkup",                  location: "Tower 3, Podium Level",              phone: "+91 99001 00121",                               hours: "7:00 AM – 6:00 PM",  days: "Mon – Sat", tags: ["Executive Health", "Annual Checkup", "Corporate"] },
  { name: "CardioScan Centre",              type: "diagnostics", subtype: "Cardiac Diagnostics",                location: "Block D, Health Strip",              phone: "+91 99001 00131",                               hours: "9:00 AM – 6:00 PM",  days: "Mon – Fri", tags: ["ECG", "Echo", "Stress Test", "Holter"] },
  { name: "HomeTest Express",               type: "diagnostics", subtype: "Home Sample Collection",             location: "Neopolis District-wide",             phone: "+91 99001 00141",                               hours: "6:00 AM – 10:00 AM", days: "Mon – Sun", tags: ["Home Visit", "Fasting Tests", "Reports Online"] },

  // ── Pharmacies ─────────────────────────────────────────────────────────────
  { name: "Apollo Pharmacy – Block A",      type: "pharmacies",  subtype: "24hr Pharmacy",                      location: "Healthcare Zone, Block A",           phone: "+91 99001 00151",                               hours: "24 hours",           days: "All days",  open24: true, tags: ["Prescription", "OTC", "Baby Care", "Diabetic Supplies"] },
  { name: "MedPlus – Neopolis Central",     type: "pharmacies",  subtype: "24hr Pharmacy",                      location: "Ground Floor, Grand Mall",           phone: "+91 99001 00161",                               hours: "8:00 AM – 11:00 PM", days: "Mon – Sun", tags: ["Generics", "Branded", "Surgical Supplies"] },
  { name: "Wellness Pharmacy",              type: "pharmacies",  subtype: "Ayurvedic & Herbal",                 location: "Residential Block C, Shop 4",        phone: "+91 99001 00171",                               hours: "9:00 AM – 10:00 PM", days: "Mon – Sun", tags: ["Ayurveda", "Homeopathy", "Supplements"] },
  { name: "NeoCompound Rx",                 type: "pharmacies",  subtype: "Compounding Pharmacy",               location: "Block B, Health Strip",              phone: "+91 99001 00181",                               hours: "9:00 AM – 7:00 PM",  days: "Mon – Sat", tags: ["Custom Formulas", "Hormone Therapy", "Veterinary"] },
];

function ProviderCard({ p }: { p: Provider }) {
  const cfg = TYPE_MAP[p.type];
  const Icon = cfg.icon;
  return (
    <div className="card p-5 space-y-3 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
      <div className="flex items-start justify-between gap-2">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${cfg.color}`}>
          <Icon className="w-5 h-5" />
        </div>
        {p.open24 && (
          <span className="text-xs font-bold text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">
            24 / 7
          </span>
        )}
      </div>
      <div>
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${cfg.color}`}>{p.subtype}</span>
        <h3 className="font-bold text-gray-900 text-sm mt-2 leading-snug">{p.name}</h3>
        <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
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
      <div className="space-y-2">
        {p.emergency && cfg.emergencyColor && (
          <a
            href={`tel:${p.emergency.replace(/\s/g, "")}`}
            className={`flex items-center justify-center gap-2 w-full text-white font-bold text-xs py-2.5 rounded-xl transition-colors ${cfg.emergencyColor}`}
          >
            <PhoneCall className="w-3.5 h-3.5" /> Emergency: {p.emergency}
          </a>
        )}
        <a
          href={`tel:${p.phone.replace(/\s/g, "")}`}
          className="flex items-center justify-center gap-2 w-full border border-gray-200 hover:border-gray-400 text-gray-600 hover:text-gray-900 text-xs font-semibold py-2 rounded-lg transition-colors"
        >
          <Phone className="w-3.5 h-3.5" /> {p.phone}
        </a>
      </div>
    </div>
  );
}

function HealthInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const VALID: HealthType[] = ["hospitals", "ambulance", "clinics", "diagnostics", "pharmacies"];
  const typeParam = searchParams.get("type") as HealthType | null;

  const [active, setActive] = useState<HealthType>(
    typeParam && VALID.includes(typeParam) ? typeParam : "hospitals"
  );
  const [subFilter, setSubFilter] = useState<string>("all");

  useEffect(() => {
    const t = searchParams.get("type") as HealthType | null;
    if (t && VALID.includes(t)) { setActive(t); setSubFilter("all"); }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const handleTabChange = (t: HealthType) => {
    setActive(t);
    setSubFilter("all");
    router.replace(`/health?type=${t}`, { scroll: false });
  };

  const cfg = TYPE_MAP[active];
  const subtypes = getSubtypes("Health & Wellness", cfg.taxKey);
  const filtered = PROVIDERS.filter(
    (p) => p.type === active && (subFilter === "all" || p.subtype === subFilter)
  );

  return (
    <>
      {/* ── Hero ── */}
      <section className="bg-gradient-to-br from-red-700 to-red-500 text-white py-14 md:py-20">
        <SectionWrapper tight>
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-1.5 bg-red-600 border border-red-400 text-white text-xs font-bold px-3 py-1 rounded-full mb-4">
              Health &amp; Emergency Services
            </span>
            <h1 className="text-3xl md:text-5xl font-extrabold mt-3 mb-4">
              Neopolis <span className="text-red-200">Health Directory</span>
            </h1>
            <p className="text-red-100 text-lg mb-6">
              Hospitals, ambulance services, clinics, diagnostics, and pharmacies — emergency numbers always one tap away.
            </p>
            <div className="flex flex-wrap gap-2">
              {TYPE_CONFIG.map((t) => (
                <button
                  key={t.id}
                  onClick={() => handleTabChange(t.id)}
                  className={`inline-flex items-center gap-2 font-semibold px-4 py-2.5 rounded-xl text-sm transition-colors ${
                    active === t.id
                      ? "bg-white text-gray-900"
                      : "bg-red-600 border border-red-400 text-red-100 hover:bg-red-500"
                  }`}
                >
                  <t.icon className="w-4 h-4" /> {t.label}
                </button>
              ))}
              <Link
                href="/health/wellness"
                className="inline-flex items-center gap-2 font-semibold px-4 py-2.5 rounded-xl text-sm bg-purple-600 border border-purple-400 text-white hover:bg-purple-500 transition-colors"
              >
                <Sparkles className="w-4 h-4" /> Wellness
              </Link>
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
            <Link
              href="/health/wellness"
              className="flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium whitespace-nowrap border border-gray-200 text-gray-600 hover:border-purple-400 hover:text-purple-700 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" /> Wellness
            </Link>
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
                {filtered.length} provider{filtered.length !== 1 ? "s" : ""} in Neopolis
              </p>
            </div>
          </div>

          {filtered.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map((p) => <ProviderCard key={p.name} p={p} />)}
            </div>
          ) : (
            <div className="text-center py-16 text-gray-400">
              <p className="text-sm">No providers listed for this speciality yet.</p>
              <p className="text-xs mt-1">Register your practice below to get listed.</p>
            </div>
          )}
        </SectionWrapper>
      </section>

      {/* ── CTA ── */}
      <section className="bg-red-700 text-white">
        <SectionWrapper>
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
                Register Your Health Business
              </h2>
              <p className="text-red-200 mb-5">
                Get listed in the Neopolis Health Directory. Residents search for hospitals, clinics, and pharmacies here first.
              </p>
              <ul className="space-y-2 text-sm text-red-100">
                {[
                  "Emergency number shown prominently",
                  "Business hours & location visible",
                  "Searchable by speciality",
                  "Reach 12,000+ district residents",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-red-300 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                href="/auth/register"
                className="inline-flex items-center gap-2 mt-6 bg-white text-red-700 font-bold px-6 py-3 rounded-xl text-sm hover:bg-red-50 transition-colors"
              >
                Register Now <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="bg-red-800 rounded-2xl border border-red-600 p-6">
              <LeadForm
                title="List Your Health Service"
                subtitle="We'll set up your profile with emergency numbers and hours."
                purpose="health-directory"
                dark
              />
            </div>
          </div>
        </SectionWrapper>
      </section>
    </>
  );
}

export default function HealthClient() {
  return (
    <Suspense>
      <HealthInner />
    </Suspense>
  );
}
