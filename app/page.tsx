import Link from "next/link";
import {
  Building2,
  Home,
  ShoppingBag,
  Newspaper,
  Wrench,
  ArrowRight,
  TrendingUp,
  Users,
  MapPin,
  Star,
  CheckCircle,
  BarChart3,
  Zap,
} from "lucide-react";
import SectionWrapper from "@/components/SectionWrapper";
import LeadForm from "@/components/LeadForm";

// ─── Static data ────────────────────────────────────────────────────────────

const STATS = [
  { label: "Acres of Development", value: "100+", icon: MapPin },
  { label: "Residential Units", value: "4,200+", icon: Home },
  { label: "Retail Sq Ft", value: "8 Lakh", icon: ShoppingBag },
  { label: "Registered Users", value: "12,000+", icon: Users },
];

const MODULES = [
  {
    href: "/real-estate",
    icon: Building2,
    color: "bg-amber-50 text-amber-700",
    title: "Real Estate Intelligence",
    desc: "Project pages, price trends, construction progress, floor plans, and live inventory for every tower.",
    tags: ["Developer Listings", "Price History", "Drone Videos"],
  },
  {
    href: "/rentals",
    icon: Home,
    color: "bg-emerald-50 text-emerald-700",
    title: "Rentals & Resale",
    desc: "Residential, commercial, and retail spaces available to rent or buy — verified owners and brokers.",
    tags: ["Residential", "Office Leasing", "Resale"],
  },
  {
    href: "/directory",
    icon: ShoppingBag,
    color: "bg-purple-50 text-purple-600",
    title: "Commercial Directory",
    desc: "Every brand, restaurant, cinema, gym, and salon in the district — with hours, offers, and events.",
    tags: ["Mall Stores", "F&B", "Entertainment"],
  },
  {
    href: "/news",
    icon: Newspaper,
    color: "bg-orange-50 text-orange-600",
    title: "Local News & Updates",
    desc: "Construction milestones, infrastructure news, new launches, and community stories — every week.",
    tags: ["Construction", "Policy", "Community"],
  },
  {
    href: "/services",
    icon: Wrench,
    color: "bg-red-50 text-red-600",
    title: "Resident Services",
    desc: "Move-in concierge, interior design, utilities setup, and facility management — all curated.",
    tags: ["Move-In", "Interiors", "Maintenance"],
  },
  {
    href: "/advertise",
    icon: BarChart3,
    color: "bg-yellow-50 text-yellow-600",
    title: "Advertise & Partner",
    desc: "Reach buyers, tenants, and residents. Developer listings, sponsored content, and data products.",
    tags: ["₹3L–25L/yr", "SaaS Data", "Native Ads"],
  },
];

const FEATURED_PROJECTS = [
  {
    name: "Neopolis Apex Tower",
    type: "Luxury Residential",
    status: "Under Construction",
    statusColor: "tag-orange",
    units: "320 units",
    price: "₹1.2 Cr – ₹3.8 Cr",
    completion: "Dec 2026",
    progress: 62,
  },
  {
    name: "Neopolis Business Park",
    type: "Grade A Office",
    status: "Completed",
    statusColor: "tag-green",
    units: "4.5 Lakh sq ft",
    price: "₹80 – ₹120/sq ft/mo",
    completion: "Operational",
    progress: 100,
  },
  {
    name: "Neopolis Grand Mall",
    type: "Retail & Entertainment",
    status: "Pre-Launch",
    statusColor: "tag-blue",
    units: "250 retail units",
    price: "₹120 – ₹200/sq ft/mo",
    completion: "Jun 2027",
    progress: 28,
  },
];

const LATEST_NEWS = [
  {
    tag: "Construction",
    tagColor: "tag-orange",
    title: "Apex Tower reaches 18th floor slab — on-schedule for Dec 2026 delivery",
    date: "Mar 20, 2026",
    readTime: "3 min",
  },
  {
    tag: "Infrastructure",
    tagColor: "tag-blue",
    title: "Metro connectivity to Neopolis confirmed — Phase 2 station announced",
    date: "Mar 15, 2026",
    readTime: "5 min",
  },
  {
    tag: "New Launch",
    tagColor: "tag-green",
    title: "Phase 3 residential towers open for pre-bookings — prices start ₹85 lakh",
    date: "Mar 10, 2026",
    readTime: "4 min",
  },
];

const FLYWHEEL = [
  { step: "1", title: "Developers list inventory", icon: Building2 },
  { step: "2", title: "Buyers & tenants discover", icon: Users },
  { step: "3", title: "Retailers gain footfall", icon: ShoppingBag },
  { step: "4", title: "Data improves decisions", icon: BarChart3 },
  { step: "5", title: "Platform becomes indispensable", icon: Zap },
];

// ─── Page ────────────────────────────────────────────────────────────────────

export default function HomePage() {
  return (
    <>
      {/* ── Hero ── */}
      <section className="relative bg-gradient-to-br from-brand-950 via-brand-900 to-brand-800 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-brand-400 via-transparent to-transparent" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Copy */}
            <div>
              <span className="inline-flex items-center gap-2 bg-amber-900/40 border border-amber-500/40 text-amber-300 text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
                <MapPin className="w-3.5 h-3.5" />
                India&apos;s next urban micro-city
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-5">
                The Digital Hub for{" "}
                <span className="text-brand-400">Neopolis</span>
              </h1>
              <p className="text-lg text-brand-200 mb-8 leading-relaxed max-w-xl">
                Real estate intelligence, rentals, retail discovery, local news,
                and resident services — all for one 100-acre urban district.
                The only platform you need.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link href="/real-estate" className="btn-primary">
                  <Building2 className="w-4 h-4" />
                  Explore Projects
                </Link>
                <Link
                  href="/advertise"
                  className="btn-secondary border-brand-500 text-brand-300 hover:bg-brand-800"
                >
                  Partner With Us
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
              {/* Trust badges */}
              <div className="flex flex-wrap items-center gap-5 mt-8 text-sm text-brand-300">
                {["Verified Listings", "Weekly Updates", "100% Free for Buyers"].map(
                  (t) => (
                    <span key={t} className="flex items-center gap-1.5">
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                      {t}
                    </span>
                  )
                )}
              </div>
            </div>

            {/* Lead form */}
            <div className="bg-brand-900/60 backdrop-blur rounded-2xl border border-brand-700 p-6">
              <LeadForm
                title="Get Free Expert Advice"
                subtitle="Buy, rent, or invest in Neopolis — our advisors will guide you."
                purpose="homepage-hero"
                dark
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="bg-gradient-to-r from-amber-50 via-white to-emerald-50 border-b border-amber-100">
        <SectionWrapper tight>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {STATS.map((s, i) => (
              <div key={s.label} className="text-center">
                <s.icon className={`w-6 h-6 mx-auto mb-2 ${i % 2 === 0 ? "text-amber-600" : "text-emerald-600"}`} />
                <div className={`text-3xl font-extrabold ${i % 2 === 0 ? "text-amber-600" : "text-emerald-700"}`}>
                  {s.value}
                </div>
                <div className="text-sm text-gray-500 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </SectionWrapper>
      </section>

      {/* ── Platform Modules ── */}
      <SectionWrapper id="modules">
        <div className="text-center mb-10">
          <h2 className="section-heading">Everything Neopolis, One Platform</h2>
          <div className="flex justify-center gap-1.5 mt-3 mb-3">
            <div className="w-8 h-1 rounded-full bg-amber-500" />
            <div className="w-8 h-1 rounded-full bg-emerald-600" />
          </div>
          <p className="text-gray-500 mt-2 max-w-xl mx-auto">
            Six integrated modules serving homebuyers, tenants, retailers,
            developers, and service providers.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {MODULES.map((m) => (
            <Link key={m.href} href={m.href} className="card p-6 group">
              <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${m.color}`}
              >
                <m.icon className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2 group-hover:text-brand-600 transition-colors">
                {m.title}
              </h3>
              <p className="text-sm text-gray-500 mb-4 leading-relaxed">
                {m.desc}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {m.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </Link>
          ))}
        </div>
      </SectionWrapper>

      {/* ── Featured Projects ── */}
      <section className="bg-gray-50" id="projects">
        <SectionWrapper>
          <div className="flex items-center justify-between mb-8">
            <h2 className="section-heading">Featured Projects</h2>
            <Link
              href="/real-estate"
              className="text-brand-600 hover:text-brand-700 text-sm font-semibold flex items-center gap-1"
            >
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {FEATURED_PROJECTS.map((p, i) => (
              <div key={p.name} className="card p-5">
                {/* Placeholder image strip */}
                <div className={`h-36 rounded-lg mb-4 flex items-center justify-center ${
                  i === 0 ? "bg-gradient-to-br from-amber-100 to-amber-200" :
                  i === 1 ? "bg-gradient-to-br from-emerald-100 to-emerald-200" :
                            "bg-gradient-to-br from-brand-100 to-brand-200"
                }`}>
                  <Building2 className={`w-10 h-10 ${
                    i === 0 ? "text-amber-500" :
                    i === 1 ? "text-emerald-600" :
                              "text-brand-400"
                  }`} />
                </div>
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm">
                      {p.name}
                    </h3>
                    <p className="text-xs text-gray-400">{p.type}</p>
                  </div>
                  <span className={p.statusColor}>{p.status}</span>
                </div>
                <div className="space-y-1 text-xs text-gray-500 mb-3">
                  <div className="flex justify-between">
                    <span>{p.units}</span>
                    <span className="font-semibold text-gray-700">
                      {p.price}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Completion</span>
                    <span>{p.completion}</span>
                  </div>
                </div>
                {/* Progress bar */}
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-brand-500 rounded-full transition-all"
                    style={{ width: `${p.progress}%` }}
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  {p.progress}% construction complete
                </p>
              </div>
            ))}
          </div>
        </SectionWrapper>
      </section>

      {/* ── Latest News ── */}
      <SectionWrapper id="news-preview">
        <div className="flex items-center justify-between mb-8">
          <h2 className="section-heading">Latest from Neopolis</h2>
          <Link
            href="/news"
            className="text-brand-600 hover:text-brand-700 text-sm font-semibold flex items-center gap-1"
          >
            All news <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {LATEST_NEWS.map((n) => (
            <Link key={n.title} href="/news" className="card p-5 group">
              <span className={`${n.tagColor} mb-3`}>{n.tag}</span>
              <h3 className="font-semibold text-gray-900 text-sm mt-2 mb-3 leading-snug group-hover:text-brand-600 transition-colors">
                {n.title}
              </h3>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <span>{n.date}</span>
                <span>·</span>
                <span>{n.readTime} read</span>
              </div>
            </Link>
          ))}
        </div>
      </SectionWrapper>

      {/* ── Strategic Flywheel ── */}
      <section className="bg-brand-950 text-white">
        <SectionWrapper>
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
              Why NeopolisNews Scales
            </h2>
            <p className="text-brand-300 max-w-xl mx-auto text-sm">
              The platform flywheel: each stakeholder strengthens the next.
            </p>
          </div>
          <div className="flex flex-col md:flex-row items-center justify-center gap-0 md:gap-0">
            {FLYWHEEL.map((f, i) => (
              <div key={f.step} className="flex flex-col md:flex-row items-center">
                <div className="flex flex-col items-center text-center w-40 px-2">
                  <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center mb-3 ${
                    parseInt(f.step) % 2 === 1
                      ? "bg-amber-800/60 border-amber-500"
                      : "bg-emerald-800/60 border-emerald-500"
                  }`}>
                    <f.icon className={`w-5 h-5 ${parseInt(f.step) % 2 === 1 ? "text-amber-300" : "text-emerald-300"}`} />
                  </div>
                  <span className={`text-xs font-bold mb-1 ${parseInt(f.step) % 2 === 1 ? "text-amber-400" : "text-emerald-400"}`}>
                    STEP {f.step}
                  </span>
                  <span className="text-sm font-semibold text-white leading-snug">
                    {f.title}
                  </span>
                </div>
                {i < FLYWHEEL.length - 1 && (
                  <ArrowRight className="text-brand-600 rotate-90 md:rotate-0 my-3 md:my-0 shrink-0" />
                )}
              </div>
            ))}
          </div>
        </SectionWrapper>
      </section>

      {/* ── Monetisation Preview ── */}
      <section className="bg-gradient-to-r from-accent-500 to-orange-600 text-white">
        <SectionWrapper tight>
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">
                Grow Your Business in Neopolis
              </h2>
              <p className="text-orange-100 text-sm max-w-lg">
                Developer listings from ₹3L/yr · Sponsored content · Premium
                analytics · Lead generation for brokers & service vendors.
              </p>
              <div className="flex flex-wrap gap-4 mt-4 text-sm">
                {[
                  "Tier-1 Developer: ₹10–25 Lakhs/yr",
                  "Retail Brand: ₹1–5 Lakhs/yr",
                  "Broker Plan: ₹50K–2 Lakhs/yr",
                ].map((t) => (
                  <span key={t} className="flex items-center gap-1.5">
                    <Star className="w-4 h-4 text-yellow-300 fill-yellow-300" />
                    {t}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex flex-wrap gap-3 shrink-0">
              <Link
                href="/advertise"
                className="bg-white text-accent-600 font-bold px-5 py-2.5 rounded-lg hover:bg-orange-50 transition-colors inline-flex items-center gap-2"
              >
                <TrendingUp className="w-4 h-4" />
                See Plans
              </Link>
              <Link
                href="/advertise#contact"
                className="border-2 border-white text-white font-bold px-5 py-2.5 rounded-lg hover:bg-white/10 transition-colors"
              >
                Talk to Sales
              </Link>
            </div>
          </div>
        </SectionWrapper>
      </section>
    </>
  );
}
