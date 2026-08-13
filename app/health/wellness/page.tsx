"use client";

import { Suspense, useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Sparkles,
  Dumbbell,
  Music2,
  UserRound,
  MapPin,
  Phone,
  Clock,
  ArrowRight,
  CheckCircle,
  Calendar,
  IndianRupee,
  Video,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import SectionWrapper from "@/components/SectionWrapper";
import LeadForm from "@/components/LeadForm";
import SaveButton from "@/components/SaveButton";
import { createClient } from "@/lib/supabase/client";

type WellnessType = "spa" | "gym" | "studio" | "trainer" | "sessions";

const TABS: { id: WellnessType; label: string; icon: React.ElementType; color: string; subtypes: string[] }[] = [
  { id: "spa",     label: "Massage Spa",   icon: Sparkles,  color: "bg-pink-50 text-pink-600",   subtypes: ["Massage Spa"] },
  { id: "gym",     label: "Gym",           icon: Dumbbell,  color: "bg-blue-50 text-blue-600",   subtypes: ["Gym"] },
  { id: "studio",  label: "Studio",        icon: Music2,    color: "bg-green-50 text-green-600", subtypes: ["Yoga Studio", "Dance Studio"] },
  { id: "trainer", label: "Trainers",      icon: UserRound, color: "bg-amber-50 text-amber-600", subtypes: ["Personal Trainers"] },
  { id: "sessions",label: "Live Sessions", icon: Video,     color: "bg-purple-50 text-purple-600", subtypes: [] },
];

const TAB_MAP = Object.fromEntries(TABS.map((t) => [t.id, t]));
const BUSINESS_TABS = TABS.filter((t) => t.id !== "sessions");

// ─── Business (Spa / Gym / Studio / Trainer) — real data ───────────────────────

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

function getTodayHours(timings: DayTiming[] | null): string {
  if (!timings || timings.length === 0) return "";
  const days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  const today = days[new Date().getDay()];
  const t = timings.find((d) => d.day === today);
  if (!t) return "";
  if (t.closed) return "Closed today";
  return `${t.open} – ${t.close}`;
}

function BusinessCard({ b, typeId }: { b: Business; typeId: WellnessType }) {
  const cfg = TAB_MAP[typeId];
  const Icon = cfg.icon;
  const phones: PhoneEntry[] = b.phone_numbers && b.phone_numbers.length > 0
    ? b.phone_numbers
    : b.contact_phone ? [{ number: b.contact_phone, purpose: "Call" }] : [];
  const todayHours = getTodayHours(b.timings);

  return (
    <Link
      href={`/businesses/${b.id}`}
      className="card p-5 space-y-3 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 block"
    >
      <div className="flex items-start justify-between gap-2">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${cfg.color}`}>
          {b.logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={b.logo} alt="" className="w-10 h-10 rounded-xl object-cover" />
          ) : (
            <Icon className="w-5 h-5" />
          )}
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {b.verified && (
            <span className="flex items-center gap-1 text-xs font-bold text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">
              <ShieldCheck className="w-3 h-3" /> Verified
            </span>
          )}
          <SaveButton itemType="business" itemId={b.id} size="sm" />
        </div>
      </div>

      <div>
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${cfg.color}`}>
          {b.subtypes?.[0] ?? cfg.label}
        </span>
        <h3 className="font-bold text-gray-900 text-sm mt-2 leading-snug">{b.name}</h3>
        {b.address && (
          <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
            <MapPin className="w-3 h-3 shrink-0" /> {b.address}
          </p>
        )}
      </div>

      {b.subtypes && b.subtypes.length > 1 && (
        <div className="flex flex-wrap gap-1">
          {b.subtypes.slice(1, 4).map((tag) => (
            <span key={tag} className="text-xs bg-gray-50 text-gray-500 border border-gray-100 px-2 py-0.5 rounded-full">
              {tag}
            </span>
          ))}
        </div>
      )}

      {todayHours && (
        <p className="text-xs text-gray-500 flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-gray-400" /> Today: {todayHours}
        </p>
      )}

      <div onClick={(e) => e.preventDefault()}>
        {phones.length > 0 ? (
          <a
            href={`tel:${phones[0].number.replace(/\D/g, "")}`}
            className="flex items-center justify-center gap-2 w-full border border-gray-200 hover:border-purple-400 hover:text-purple-700 text-gray-600 text-xs font-semibold py-2 rounded-lg transition-colors"
          >
            <Phone className="w-3.5 h-3.5" /> {phones[0].number}
          </a>
        ) : (
          <span className="flex items-center justify-center gap-2 w-full border border-gray-100 text-gray-400 text-xs py-2 rounded-lg">
            <Phone className="w-3.5 h-3.5" /> Contact via profile
          </span>
        )}
      </div>
    </Link>
  );
}

// ─── Live Sessions — real data (unchanged) ─────────────────────────────────────

interface LiveSession {
  id: string;
  trainer_name: string;
  session_type: string;
  language: string;
  price_inr: number;
  max_seats: number;
  seats_taken: number;
  platform_label: string;
  platform: string;
  start_date: string;
  end_date: string;
}

const PLATFORM_COLOR: Record<string, string> = {
  zoom:  "bg-blue-50 text-blue-700 border-blue-200",
  meet:  "bg-green-50 text-green-700 border-green-200",
  teams: "bg-indigo-50 text-indigo-700 border-indigo-200",
  webex: "bg-red-50 text-red-700 border-red-200",
  other: "bg-gray-50 text-gray-600 border-gray-200",
};

function SessionCard({ s }: { s: LiveSession }) {
  const seatsLeft = s.max_seats - s.seats_taken;
  return (
    <Link href={`/wellness/sessions/${s.id}`}
      className="card p-5 space-y-3 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 block">
      <div className="flex items-start justify-between gap-2">
        <span className="text-xs font-bold px-2.5 py-1 bg-purple-50 text-purple-700 border border-purple-200 rounded-full">{s.session_type}</span>
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${PLATFORM_COLOR[s.platform] ?? PLATFORM_COLOR.other}`}>{s.platform_label}</span>
      </div>
      <div>
        <h3 className="font-bold text-gray-900 text-sm">{s.trainer_name}</h3>
        <p className="text-xs text-gray-400 mt-0.5">{s.language}</p>
      </div>
      <p className="text-xs text-gray-500 flex items-center gap-1.5">
        <Calendar className="w-3.5 h-3.5 text-gray-400" />
        {new Date(s.start_date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })} –{" "}
        {new Date(s.end_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
      </p>
      <div className="flex items-center justify-between pt-1 border-t border-gray-100">
        <div className="flex items-center gap-1 text-sm font-bold text-amber-700">
          <IndianRupee className="w-3.5 h-3.5" />
          <span>{s.price_inr.toLocaleString("en-IN")}<span className="text-xs text-gray-400 font-normal">/mo</span></span>
        </div>
        <span className={`text-xs font-semibold ${seatsLeft <= 3 ? "text-red-600" : "text-gray-500"}`}>
          {seatsLeft > 0 ? `${seatsLeft} seats left` : "Full"}
        </span>
      </div>
      <div className="flex items-center justify-center gap-2 w-full border border-purple-200 hover:border-purple-400 text-purple-700 text-xs font-semibold py-2 rounded-lg transition-colors">
        <Video className="w-3.5 h-3.5" /> View &amp; Enroll
      </div>
    </Link>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

function WellnessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const typeParam = searchParams.get("type") as WellnessType | null;
  const VALID_TYPES: WellnessType[] = ["spa", "gym", "studio", "trainer", "sessions"];

  const [active, setActive] = useState<WellnessType>(
    typeParam && VALID_TYPES.includes(typeParam) ? typeParam : "spa"
  );
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [businessesLoading, setBusinessesLoading] = useState(false);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [liveSessions, setLiveSessions] = useState<LiveSession[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);

  useEffect(() => {
    const t = searchParams.get("type") as WellnessType | null;
    if (t && VALID_TYPES.includes(t)) setActive(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const fetchBusinesses = useCallback(async (typeId: WellnessType) => {
    const tab = TAB_MAP[typeId];
    if (!tab || tab.subtypes.length === 0) return;
    setBusinessesLoading(true);
    const sb = createClient();
    const { data } = await sb
      .from("businesses")
      .select("id, name, types, subtypes, address, verified, logo, contact_phone, phone_numbers, timings")
      .eq("status", "active")
      .eq("industry", "Health & Wellness")
      .contains("types", ["Wellness"])
      .overlaps("subtypes", tab.subtypes);
    setBusinesses((data as Business[]) ?? []);
    setBusinessesLoading(false);
  }, []);

  // Counts for every business tab, once on mount.
  useEffect(() => {
    async function loadCounts() {
      const sb = createClient();
      const newCounts: Record<string, number> = {};
      for (const t of BUSINESS_TABS) {
        const { count } = await sb
          .from("businesses")
          .select("id", { count: "exact", head: true })
          .eq("status", "active")
          .eq("industry", "Health & Wellness")
          .contains("types", ["Wellness"])
          .overlaps("subtypes", t.subtypes);
        newCounts[t.id] = count ?? 0;
      }
      setCounts(newCounts);
    }
    loadCounts();
  }, []);

  useEffect(() => {
    if (active === "sessions") return;
    fetchBusinesses(active);
  }, [active, fetchBusinesses]);

  useEffect(() => {
    if (active !== "sessions") return;
    setSessionsLoading(true);
    fetch("/api/wellness-sessions")
      .then((r) => r.json())
      .then((data) => { setLiveSessions(Array.isArray(data) ? data : []); })
      .finally(() => setSessionsLoading(false));
  }, [active]);

  function handleTabChange(t: WellnessType) {
    setActive(t);
    router.replace(`/health/wellness?type=${t}`, { scroll: false });
  }

  const isSessions = active === "sessions";
  const cfg = TAB_MAP[active];
  const count = isSessions ? liveSessions.length : businesses.length;

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
                  onClick={() => handleTabChange(tab.id)}
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
              const c = tab.id === "sessions" ? liveSessions.length : (counts[tab.id] ?? 0);
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
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
              <h2 className="section-heading !mb-0">{cfg.label}</h2>
              <p className="text-sm text-gray-500 mt-1">
                {count} {isSessions ? "live sessions" : "businesses"} in Neopolis
              </p>
            </div>
          </div>

          {isSessions ? (
            sessionsLoading ? (
              <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-purple-500" /></div>
            ) : liveSessions.length === 0 ? (
              <div className="text-center py-16">
                <Video className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                <p className="text-sm text-gray-500">No live sessions at the moment. Check back soon.</p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {liveSessions.map((s) => <SessionCard key={s.id} s={s} />)}
              </div>
            )
          ) : businessesLoading ? (
            <div className="flex items-center justify-center py-20 text-gray-400">
              <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading…
            </div>
          ) : businesses.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {businesses.map((b) => <BusinessCard key={b.id} b={b} typeId={active} />)}
            </div>
          ) : (
            <div className="text-center py-16 text-gray-400">
              <p className="text-sm">No providers listed for this category yet.</p>
              <p className="text-xs mt-1">Register your business below to get listed.</p>
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
                {active === "trainer" ? "Register as a Trainer" : "List Your Wellness Business"}
              </h2>
              <p className="text-purple-200 mb-5">
                {active === "trainer"
                  ? "Get hired by Neopolis residents. Share your schedule, speciality and monthly rate."
                  : "Get discovered by Neopolis residents looking for spas, gyms, and studios in the district."}
              </p>
              <ul className="space-y-2 text-sm text-purple-100">
                {(active === "trainer"
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
                title={active === "trainer" ? "Register as a Trainer" : "List Your Wellness Business"}
                subtitle={active === "trainer"
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

export default function WellnessPage() {
  return (
    <Suspense>
      <WellnessContent />
    </Suspense>
  );
}
