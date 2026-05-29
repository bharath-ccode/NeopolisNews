"use client";

import { Suspense, useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Hospital, Ambulance, Stethoscope, Pill, FlaskConical,
  PhoneCall, Phone, MapPin, Clock, CheckCircle, ArrowRight,
  Sparkles, ShieldCheck, Loader2,
} from "lucide-react";
import SectionWrapper from "@/components/SectionWrapper";
import LeadForm from "@/components/LeadForm";
import { getSubtypes } from "@/lib/businessDirectory";
import { createClient } from "@/lib/supabase/client";

type HealthType = "hospitals" | "ambulance" | "clinics" | "diagnostics" | "pharmacies";

interface PhoneEntry { number: string; purpose: string; }

interface DayTiming { day: string; open: string; close: string; closed: boolean; }

interface Business {
  id: string;
  name: string;
  types: string[];
  subtypes: string[];
  address: string;
  verified: boolean;
  logo: string | null;
  contact_phone: string | null;
  phone_numbers: PhoneEntry[] | null;
  timings: DayTiming[] | null;
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

const EMERGENCY_PURPOSES = ["emergency", "ambulance", "icu", "helpline"];

function getTodayHours(timings: DayTiming[] | null): string {
  if (!timings || timings.length === 0) return "";
  const days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  const today = days[new Date().getDay()];
  const t = timings.find((d) => d.day === today);
  if (!t) return "";
  if (t.closed) return "Closed today";
  return `${t.open} – ${t.close}`;
}

function is24x7(timings: DayTiming[] | null): boolean {
  if (!timings || timings.length === 0) return false;
  return timings.every(
    (t) => !t.closed && t.open === "00:00" && (t.close === "00:00" || t.close === "23:59")
  );
}

function BusinessCard({ biz, typeId }: { biz: Business; typeId: HealthType }) {
  const cfg = TYPE_MAP[typeId];
  const Icon = cfg.icon;
  const hasAppointments = biz.phone_numbers?.some((p) =>
    p.purpose.toLowerCase().includes("appointment")
  );
  const phones: PhoneEntry[] = [
    // If no dedicated appointments number, prepend contact_phone as Appointments
    ...(biz.contact_phone && !hasAppointments
      ? [{ number: biz.contact_phone, purpose: "Appointments" }]
      : []),
    ...(biz.phone_numbers ?? []),
  ];

  const emergencyPhones = phones.filter((p) =>
    EMERGENCY_PURPOSES.some((kw) => p.purpose.toLowerCase().includes(kw))
  );
  const mainPhones = phones.filter(
    (p) => !EMERGENCY_PURPOSES.some((kw) => p.purpose.toLowerCase().includes(kw))
  );

  const open24 = is24x7(biz.timings);
  const todayHours = getTodayHours(biz.timings);
  const primarySubtype = biz.types?.[0] ?? cfg.label;

  return (
    <Link
      href={`/businesses/${biz.id}`}
      className="card p-5 space-y-3 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 block"
    >
      <div className="flex items-start justify-between gap-2">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${cfg.color}`}>
          {biz.logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={biz.logo} alt="" className="w-10 h-10 rounded-xl object-cover" />
          ) : (
            <Icon className="w-5 h-5" />
          )}
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {biz.verified && (
            <span className="flex items-center gap-1 text-xs font-bold text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">
              <ShieldCheck className="w-3 h-3" /> Verified
            </span>
          )}
          {open24 && (
            <span className="text-xs font-bold text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">
              24 / 7
            </span>
          )}
        </div>
      </div>

      <div>
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${cfg.color}`}>{primarySubtype}</span>
        <h3 className="font-bold text-gray-900 text-sm mt-2 leading-snug">{biz.name}</h3>
        {biz.address && (
          <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
            <MapPin className="w-3 h-3 shrink-0" /> {biz.address}
          </p>
        )}
      </div>

      {biz.subtypes && biz.subtypes.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {biz.subtypes.slice(0, 4).map((tag) => (
            <span key={tag} className="text-xs bg-gray-50 text-gray-500 border border-gray-100 px-2 py-0.5 rounded-full">
              {tag}
            </span>
          ))}
        </div>
      )}

      {todayHours && !open24 && (
        <p className="text-xs text-gray-500 flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-gray-400" /> Today: {todayHours}
        </p>
      )}

      <div className="space-y-2" onClick={(e) => e.preventDefault()}>
        {emergencyPhones.map((p) => (
          <a
            key={p.purpose}
            href={`tel:${p.number.replace(/\D/g, "")}`}
            className={`flex items-center justify-center gap-2 w-full text-white font-bold text-xs py-2.5 rounded-xl transition-colors ${cfg.emergencyColor || "bg-red-600 hover:bg-red-700"}`}
          >
            <PhoneCall className="w-3.5 h-3.5" /> {p.purpose}: {p.number}
          </a>
        ))}
        {mainPhones.slice(0, 2).map((p) => (
          <a
            key={p.purpose}
            href={`tel:${p.number.replace(/\D/g, "")}`}
            className="flex items-center justify-center gap-2 w-full border border-gray-200 hover:border-gray-400 text-gray-600 hover:text-gray-900 text-xs font-semibold py-2 rounded-lg transition-colors"
          >
            <Phone className="w-3.5 h-3.5" />
            {p.purpose !== "Main" && <span className="text-gray-400">{p.purpose}:</span>}
            {p.number}
          </a>
        ))}
        {phones.length === 0 && (
          <span className="flex items-center justify-center gap-2 w-full border border-gray-100 text-gray-400 text-xs py-2 rounded-lg">
            <Phone className="w-3.5 h-3.5" /> Contact via profile
          </span>
        )}
      </div>
    </Link>
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
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(false);
  const [counts, setCounts] = useState<Record<HealthType, number>>({
    hospitals: 0, ambulance: 0, clinics: 0, diagnostics: 0, pharmacies: 0,
  });

  useEffect(() => {
    const t = searchParams.get("type") as HealthType | null;
    if (t && VALID.includes(t)) { setActive(t); setSubFilter("all"); }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const fetchBusinesses = useCallback(async (type: HealthType) => {
    setLoading(true);
    const cfg = TYPE_MAP[type];
    const sb = createClient();
    const { data } = await sb
      .from("businesses")
      .select("id, name, types, subtypes, address, verified, logo, contact_phone, phone_numbers, timings")
      .eq("status", "active")
      .eq("industry", "Health & Wellness")
      .contains("types", [cfg.taxKey]);
    setBusinesses((data as Business[]) ?? []);
    setLoading(false);
  }, []);

  // Fetch counts for all tabs once on mount
  useEffect(() => {
    async function loadCounts() {
      const sb = createClient();
      const newCounts = { ...counts };
      for (const t of TYPE_CONFIG) {
        const { count } = await sb
          .from("businesses")
          .select("id", { count: "exact", head: true })
          .eq("status", "active")
          .eq("industry", "Health & Wellness")
          .contains("types", [t.taxKey]);
        newCounts[t.id] = count ?? 0;
      }
      setCounts(newCounts);
    }
    loadCounts();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchBusinesses(active);
  }, [active, fetchBusinesses]);

  const handleTabChange = (t: HealthType) => {
    setActive(t);
    setSubFilter("all");
    router.replace(`/health?type=${t}`, { scroll: false });
  };

  const cfg = TYPE_MAP[active];
  const subtypes = getSubtypes("Health & Wellness", cfg.taxKey);
  const filtered = subFilter === "all"
    ? businesses
    : businesses.filter((b) => b.types?.includes(subFilter) || b.subtypes?.includes(subFilter));

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
            {TYPE_CONFIG.map((t) => (
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
                  {counts[t.id]}
                </span>
              </button>
            ))}
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
              {!loading && (
                <p className="text-sm text-gray-500 mt-0.5">
                  {filtered.length} provider{filtered.length !== 1 ? "s" : ""} in Neopolis
                </p>
              )}
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20 text-gray-400">
              <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading…
            </div>
          ) : filtered.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map((b) => <BusinessCard key={b.id} biz={b} typeId={active} />)}
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
