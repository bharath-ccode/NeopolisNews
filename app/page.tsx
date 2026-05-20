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
  Calendar,
  Activity,
} from "lucide-react";
import SectionWrapper from "@/components/SectionWrapper";
import LeadForm from "@/components/LeadForm";
import { createAdminClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

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

// ─── Page ────────────────────────────────────────────────────────────────────

const STATUS_COLORS: Record<string, string> = {
  "Pre-Launch":        "tag-blue",
  "Under Construction":"tag-orange",
  "Ready to Move":     "tag-green",
  "Completed":         "tag-green",
};

export default async function HomePage() {
  const sb = createAdminClient();
  const { data: featuredRows } = await sb
    .from("projects")
    .select("id, project_name, project_type, lifecycle_status, total_units, price_range_min, price_range_max, banner_image_url, project_logo_url")
    .eq("featured", true)
    .order("project_name")
    .limit(6);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const featuredProjects = (featuredRows ?? []) as any[];

  return (
    <>
      {/* ── Hero ── */}
      <section className="relative bg-gradient-to-br from-gray-950 via-brand-950 to-brand-900 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-500 via-transparent to-transparent" />
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
                <span className="text-amber-400">Neopolis</span>
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
            <div className="bg-black/25 backdrop-blur rounded-2xl border border-white/10 p-6">
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

      {/* ── Banner ── */}
      <section className="relative w-full overflow-hidden" style={{ height: "clamp(220px, 40vw, 560px)" }}>
        <img
          src="/banner.png"
          alt="Neopolis Urban District"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        {/* bottom fade into stats section */}
        <div className="absolute inset-0 bg-gradient-to-t from-amber-50/80 via-transparent to-transparent" />
        {/* tagline overlay */}
        <div className="absolute inset-0 flex items-end justify-start">
          <div className="px-6 md:px-12 pb-6 md:pb-10">
            <h2 className="text-white text-3xl md:text-5xl font-extrabold leading-tight drop-shadow-lg">
              Neopolis. Financial District. Surroundings.
            </h2>
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
      {featuredProjects.length > 0 && (
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
              {featuredProjects.map((p) => {
                const status = p.lifecycle_status ?? "Under Construction";
                const statusColor = STATUS_COLORS[status] ?? "tag-blue";
                const price = p.price_range_min && p.price_range_max
                  ? `₹${(p.price_range_min / 100).toFixed(0)}L – ₹${(p.price_range_max / 100).toFixed(0)}L`
                  : p.price_range_min
                  ? `From ₹${(p.price_range_min / 100).toFixed(0)}L`
                  : null;
                return (
                  <Link key={p.id} href={`/real-estate/${p.id}`} className="card p-5 group hover:shadow-md transition-shadow">
                    {p.banner_image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.banner_image_url} alt={p.project_name}
                        className="h-36 w-full object-cover rounded-lg mb-4" />
                    ) : (
                      <div className="h-36 rounded-lg mb-4 bg-gradient-to-br from-brand-100 to-brand-200 flex items-center justify-center">
                        {p.project_logo_url
                          // eslint-disable-next-line @next/next/no-img-element
                          ? <img src={p.project_logo_url} alt={p.project_name} className="h-16 w-16 object-contain" />
                          : <Building2 className="w-10 h-10 text-brand-400" />
                        }
                      </div>
                    )}
                    <div className="flex items-start justify-between mb-2">
                      <div className="min-w-0 mr-2">
                        <h3 className="font-bold text-gray-900 text-sm group-hover:text-brand-600 transition-colors leading-snug">
                          {p.project_name}
                        </h3>
                        <p className="text-xs text-gray-400 mt-0.5">{p.project_type ?? "Project"}</p>
                      </div>
                      <span className={`${statusColor} shrink-0 text-xs`}>{status}</span>
                    </div>
                    <div className="space-y-1 text-xs text-gray-500">
                      {p.total_units && (
                        <div className="flex justify-between">
                          <span>{p.total_units.toLocaleString("en-IN")} units</span>
                          {price && <span className="font-semibold text-gray-700">{price}</span>}
                        </div>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </SectionWrapper>
        </section>
      )}

      {/* ── What's on NeopolisNews ── */}
      <section className="bg-gray-900 text-white">
        <SectionWrapper>
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">Everything Neopolis, in One Place</h2>
            <p className="text-gray-400 max-w-xl mx-auto text-sm">Your neighbourhood platform — news, businesses, events, wellness, rentals, and more.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { icon: Newspaper, label: "Local News", desc: "Hyperlocal stories, civic updates, and announcements from Neopolis.", href: "/news", color: "text-blue-400", bg: "bg-blue-900/40 border-blue-700/40" },
              { icon: Building2, label: "Business Directory", desc: "Discover shops, restaurants, services, and studios in the district.", href: "/directory", color: "text-purple-400", bg: "bg-purple-900/40 border-purple-700/40" },
              { icon: Calendar, label: "Events", desc: "Concerts, food festivals, sports runs, and cultural events near you.", href: "/events", color: "text-rose-400", bg: "bg-rose-900/40 border-rose-700/40" },
              { icon: Activity, label: "Live Wellness Sessions", desc: "Book yoga, pilates, CrossFit, and meditation classes from local studios.", href: "/wellness/sessions", color: "text-emerald-400", bg: "bg-emerald-900/40 border-emerald-700/40" },
              { icon: Home, label: "Rentals & Real Estate", desc: "Browse apartments, villas, and office spaces for rent or sale.", href: "/rentals", color: "text-amber-400", bg: "bg-amber-900/40 border-amber-700/40" },
              { icon: ShoppingBag, label: "Deals & Offers", desc: "Exclusive discounts from businesses inside Neopolis.", href: "/deals", color: "text-orange-400", bg: "bg-orange-900/40 border-orange-700/40" },
            ].map((item) => (
              <Link key={item.href} href={item.href}
                className={`flex gap-4 p-5 rounded-xl border ${item.bg} hover:brightness-110 transition-all group`}>
                <div className={`w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center shrink-0`}>
                  <item.icon className={`w-5 h-5 ${item.color}`} />
                </div>
                <div>
                  <p className={`font-bold text-sm mb-1 ${item.color}`}>{item.label}</p>
                  <p className="text-gray-400 text-xs leading-relaxed">{item.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </SectionWrapper>
      </section>

      {/* Monetisation Preview — hidden until pricing is finalised */}
      {false && (
        <section className="bg-gradient-to-r from-accent-500 to-orange-600 text-white">
          <SectionWrapper tight>
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">Grow Your Business in Neopolis</h2>
                <p className="text-orange-100 text-sm max-w-lg">
                  Developer listings from ₹3L/yr · Sponsored content · Premium analytics · Lead generation for brokers &amp; service vendors.
                </p>
              </div>
            </div>
          </SectionWrapper>
        </section>
      )}
    </>
  );
}
