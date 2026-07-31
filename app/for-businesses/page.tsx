import Link from "next/link";
import {
  Store,
  Users,
  MapPin,
  BarChart3,
  Megaphone,
  CalendarDays,
  Phone,
  ShieldCheck,
  Clock,
  IndianRupee,
  CheckCircle,
  XCircle,
  ArrowRight,
  Star,
  Zap,
  TrendingUp,
  HeartPulse,
} from "lucide-react";
import SectionWrapper from "@/components/SectionWrapper";

export const metadata = {
  title: "For Businesses – Why List on NeopolisNews",
  description:
    "Reach 12,000+ residents and workers of the Neopolis district. Free verified listing, offers and events, monthly lead reports. Claim your listing in 5 minutes.",
};

const SIGNUP_HREF = "/register-business";

// ─── Stream 1: What you get from day one ────────────────────────────────────

const ONBOARDING_BENEFITS = [
  {
    icon: Store,
    color: "bg-blue-50 text-blue-600",
    title: "A verified listing page",
    desc: "Your hours, photos, floor location, phone number, and category — live on the district's most-visited local platform.",
  },
  {
    icon: Megaphone,
    color: "bg-orange-50 text-orange-600",
    title: "Offers & events, published",
    desc: "Post weekday deals, sales, and events. They appear on your page, in your category, and in the daily news digest.",
  },
  {
    icon: BarChart3,
    color: "bg-purple-50 text-purple-600",
    title: "A monthly leads report",
    desc: "Exactly how many people viewed your page, called you, and asked for directions — delivered on the 1st of every month.",
  },
  {
    icon: CalendarDays,
    color: "bg-green-50 text-green-600",
    title: "Your own business console",
    desc: "Manage your listing, offers, events, bookings, reviews, and enquiries — all from the My Business dashboard.",
  },
];

// ─── Stream 2: Why it works ─────────────────────────────────────────────────

const AUDIENCE_STATS = [
  { value: "12,000+", label: "Registered users", icon: Users },
  { value: "100 acres", label: "One walkable district", icon: MapPin },
  { value: "4,200+", label: "Homes at your doorstep", icon: Store },
  { value: "Daily", label: "News & cartoons habit", icon: Zap },
];

// ─── Stream 3: Zero risk ────────────────────────────────────────────────────

const NO_RISK = [
  {
    icon: IndianRupee,
    title: "Free listing, forever",
    desc: "The basic listing costs nothing — not a trial, not a teaser. It stays free.",
  },
  {
    icon: Clock,
    title: "5-minute setup",
    desc: "Register, add your details, go live. No paperwork, no sales call required.",
  },
  {
    icon: ShieldCheck,
    title: "No lock-in on premium",
    desc: "Premium comes with a 30-day free trial and monthly billing. Cancel anytime.",
  },
  {
    icon: CheckCircle,
    title: "Adds a channel, replaces nothing",
    desc: "Your Google and Justdial presence stays untouched. If the monthly report shows no leads, you've lost nothing.",
  },
];

// ─── Stream 4: Comparison ───────────────────────────────────────────────────

const COMPARISON = [
  {
    them: "City-wide platforms",
    theirGame: "Your ad reaches people who will never visit your store",
    ourEdge: "Every viewer lives or works within 15 minutes of your door",
  },
  {
    them: "Justdial / Google Maps",
    theirGame: "Stale listings, five-year-old phone numbers, no context",
    ourEdge: "Curated, verified, district-only — with live offers and events",
  },
  {
    them: "Newspaper / pamphlets",
    theirGame: "One-shot spend, zero measurement",
    ourEdge: "A monthly report showing views, calls, and direction requests",
  },
  {
    them: "WhatsApp groups",
    theirGame: "Noise, no discovery, messages buried in minutes",
    ourEdge: "A permanent page residents find when they search your category",
  },
];

// ─── Stream 5: How onboarding works ────────────────────────────────────────

const STEPS = [
  {
    step: "1",
    title: "Register your business",
    desc: "Name, category, contact — takes 2 minutes.",
  },
  {
    step: "2",
    title: "Build your listing",
    desc: "Hours, photos, floor location, and your first offer.",
  },
  {
    step: "3",
    title: "Go live & get found",
    desc: "Your page is visible to the whole district the same day.",
  },
];

// ─── Page ────────────────────────────────────────────────────────────────────

export default function ForBusinessesPage() {
  return (
    <>
      {/* ── Hero ── */}
      <section className="relative bg-gradient-to-br from-brand-950 via-brand-900 to-brand-800 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-brand-400 via-transparent to-transparent" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 text-center">
          <span className="inline-flex items-center gap-2 bg-brand-800 text-brand-300 text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
            <Store className="w-3.5 h-3.5" />
            For businesses in & around Neopolis
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-5 max-w-3xl mx-auto">
            Grow your business where your{" "}
            <span className="text-brand-400">customers live</span>
          </h1>
          <p className="text-lg text-brand-200 mb-8 leading-relaxed max-w-2xl mx-auto">
            12,000+ registered residents and workers check NeopolisNews for
            news, offers, and places to go — every day. Put your business in
            front of them with a free verified listing.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href={SIGNUP_HREF} className="btn-primary text-base px-6 py-3">
              Create Free Business Account
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/advertise"
              className="btn-secondary border-brand-500 text-brand-300 hover:bg-brand-800"
            >
              See Premium Plans
            </Link>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-5 mt-8 text-sm text-brand-300">
            {["Free forever listing", "5-minute setup", "Cancel premium anytime"].map(
              (t) => (
                <span key={t} className="flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  {t}
                </span>
              )
            )}
          </div>
        </div>
      </section>

      {/* ── Stream 2: The audience (why it works) ── */}
      <section className="bg-white border-b border-gray-100">
        <SectionWrapper tight>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {AUDIENCE_STATS.map((s) => (
              <div key={s.label} className="text-center">
                <s.icon className="w-6 h-6 text-brand-500 mx-auto mb-2" />
                <div className="text-3xl font-extrabold text-gray-900">
                  {s.value}
                </div>
                <div className="text-sm text-gray-500 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
          <p className="text-center text-gray-500 mt-8 max-w-2xl mx-auto">
            We don&apos;t sell impressions to strangers across the city.{" "}
            <span className="font-semibold text-gray-700">
              We sell footfall
            </span>{" "}
            — every person who sees your listing can walk to your door.
          </p>
        </SectionWrapper>
      </section>

      {/* ── Stream 1: What you get ── */}
      <SectionWrapper id="what-you-get">
        <div className="text-center mb-10">
          <h2 className="section-heading">What you get from day one</h2>
          <p className="text-gray-500 mt-2 max-w-xl mx-auto">
            Onboarding takes 5 minutes. Here&apos;s what&apos;s live the same
            day.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 gap-5">
          {ONBOARDING_BENEFITS.map((b) => (
            <div key={b.title} className="card p-6">
              <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${b.color}`}
              >
                <b.icon className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">{b.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{b.desc}</p>
            </div>
          ))}
        </div>
      </SectionWrapper>

      {/* ── Stream 4: Comparison ── */}
      <section className="bg-gray-50" id="comparison">
        <SectionWrapper>
          <div className="text-center mb-10">
            <h2 className="section-heading">
              Why NeopolisNews beats your current channels
            </h2>
            <p className="text-gray-500 mt-2 max-w-xl mx-auto">
              Keep what works. Add the one channel that only reaches your
              neighbourhood.
            </p>
          </div>
          <div className="space-y-4 max-w-4xl mx-auto">
            {COMPARISON.map((c) => (
              <div
                key={c.them}
                className="card p-5 grid md:grid-cols-[180px_1fr_1fr] gap-4 items-center"
              >
                <div className="font-bold text-gray-900 text-sm">{c.them}</div>
                <div className="flex items-start gap-2 text-sm text-gray-500">
                  <XCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  {c.theirGame}
                </div>
                <div className="flex items-start gap-2 text-sm text-gray-700 font-medium">
                  <CheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                  {c.ourEdge}
                </div>
              </div>
            ))}
          </div>
        </SectionWrapper>
      </section>

      {/* ── Stream 3: Zero risk ── */}
      <SectionWrapper id="zero-risk">
        <div className="text-center mb-10">
          <h2 className="section-heading">There&apos;s no risk in trying</h2>
          <p className="text-gray-500 mt-2 max-w-xl mx-auto">
            No contracts, no upfront spend, nothing to lose.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {NO_RISK.map((r) => (
            <div key={r.title} className="card p-6 text-center">
              <div className="w-11 h-11 rounded-xl bg-green-50 text-green-600 flex items-center justify-center mx-auto mb-4">
                <r.icon className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2 text-sm">{r.title}</h3>
              <p className="text-xs text-gray-500 leading-relaxed">{r.desc}</p>
            </div>
          ))}
        </div>
      </SectionWrapper>

      {/* ── Health & Medical launch offer ── */}
      <section className="bg-gradient-to-r from-green-600 to-emerald-700 text-white">
        <SectionWrapper tight>
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
                <HeartPulse className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold mb-1">
                  Clinics, pharmacies & diagnostics — growth offer
                </h2>
                <p className="text-green-100 text-sm max-w-lg">
                  We&apos;re expanding the Health &amp; Medical directory. The
                  next 25 health businesses to join get{" "}
                  <span className="font-bold text-white">
                    6 months of premium free
                  </span>
                  , including bookings through your listing.
                </p>
              </div>
            </div>
            <Link
              href={SIGNUP_HREF}
              className="bg-white text-emerald-700 font-bold px-5 py-2.5 rounded-lg hover:bg-green-50 transition-colors inline-flex items-center gap-2 shrink-0"
            >
              Claim the Offer
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </SectionWrapper>
      </section>

      {/* ── Stream 5: How it works + CTA ── */}
      <SectionWrapper id="get-started">
        <div className="text-center mb-10">
          <h2 className="section-heading">Live in 3 steps</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-5 max-w-4xl mx-auto mb-12">
          {STEPS.map((s) => (
            <div key={s.step} className="card p-6 text-center">
              <div className="w-10 h-10 rounded-full bg-brand-600 text-white font-extrabold flex items-center justify-center mx-auto mb-4">
                {s.step}
              </div>
              <h3 className="font-bold text-gray-900 mb-1 text-sm">{s.title}</h3>
              <p className="text-xs text-gray-500">{s.desc}</p>
            </div>
          ))}
        </div>

        <div className="bg-brand-950 rounded-2xl text-white text-center px-6 py-12 max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold mb-3">
            Claim your listing in 5 minutes
          </h2>
          <p className="text-brand-300 text-sm max-w-lg mx-auto mb-6">
            Join the developers, restaurants, gyms, and brands already reaching
            the Neopolis district every day.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href={SIGNUP_HREF} className="btn-primary text-base px-6 py-3">
              <Store className="w-4 h-4" />
              Sign Up as a Business — Free
            </Link>
            <Link
              href="/advertise#contact"
              className="btn-secondary border-brand-600 text-brand-300 hover:bg-brand-800"
            >
              <Phone className="w-4 h-4" />
              Talk to Us First
            </Link>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-5 mt-6 text-xs text-brand-400">
            <span className="flex items-center gap-1.5">
              <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
              Free forever basic listing
            </span>
            <span className="flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5" />
              Monthly leads report included
            </span>
          </div>
        </div>
      </SectionWrapper>
    </>
  );
}
