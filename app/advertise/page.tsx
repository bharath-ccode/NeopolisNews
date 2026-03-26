import {
  Building2,
  Home,
  ShoppingBag,
  Newspaper,
  BarChart3,
  CheckCircle,
  TrendingUp,
  Users,
  Star,
  ArrowRight,
  Zap,
} from "lucide-react";
import SectionWrapper from "@/components/SectionWrapper";
import LeadForm from "@/components/LeadForm";

export const metadata = {
  title: "Advertise & Partner – NeopolisNews",
  description:
    "Developer listings, sponsored content, data products, and partnership plans for the Neopolis urban district platform.",
};

// ─── Monetisation data (from the plan) ──────────────────────────────────────

const SEGMENTS = [
  {
    icon: Building2,
    title: "Developers",
    desc: "Tier-1 and mid-size developers building in Neopolis",
    value: "₹3L – ₹25L/yr",
    color: "bg-blue-50 text-blue-600",
  },
  {
    icon: Home,
    title: "Brokers & Agents",
    desc: "Real estate brokers looking for qualified leads",
    value: "₹50K – ₹2L/yr",
    color: "bg-green-50 text-green-600",
  },
  {
    icon: ShoppingBag,
    title: "Retail Brands",
    desc: "Shops, F&B, entertainment, and lifestyle brands",
    value: "₹1L – ₹5L/yr",
    color: "bg-purple-50 text-purple-600",
  },
  {
    icon: Newspaper,
    title: "Content / PR",
    desc: "Sponsored articles, press releases, and campaigns",
    value: "₹25K – ₹2L/article",
    color: "bg-orange-50 text-orange-600",
  },
  {
    icon: BarChart3,
    title: "Data Products",
    desc: "SaaS analytics for investors, banks, and PE funds",
    value: "Custom SaaS pricing",
    color: "bg-yellow-50 text-yellow-600",
  },
  {
    icon: Users,
    title: "Service Vendors",
    desc: "Movers, interior designers, maintenance, utilities",
    value: "5–20% commission",
    color: "bg-red-50 text-red-600",
  },
];

const DEVELOPER_PLANS = [
  {
    name: "Starter",
    subtitle: "Small developers & new projects",
    price: "₹3,00,000",
    period: "/year",
    badge: null,
    features: [
      "1 project page",
      "Monthly construction updates",
      "Basic inventory display",
      "Lead capture form",
      "Verified Developer badge",
      "5 featured listing slots",
    ],
    cta: "Get Started",
    highlight: false,
  },
  {
    name: "Growth",
    subtitle: "Mid-size developers",
    price: "₹8,00,000",
    period: "/year",
    badge: "Most Popular",
    features: [
      "Up to 3 project pages",
      "Drone video support",
      "Price trend dashboard",
      "Priority placement",
      "Sponsored listing badges",
      "20 featured listing slots",
      "CRM lead dashboard",
      "Quarterly analytics report",
    ],
    cta: "Get Growth",
    highlight: true,
  },
  {
    name: "Enterprise",
    subtitle: "Tier-1 developers & large projects",
    price: "₹25,00,000",
    period: "/year",
    badge: null,
    features: [
      "Unlimited project pages",
      "Homepage hero placement",
      "Dedicated account manager",
      "Custom data analytics",
      "4 sponsored articles/year",
      "Email campaigns to users",
      "API access",
      "White-label options",
    ],
    cta: "Talk to Sales",
    highlight: false,
  },
];

const RETAIL_PLANS = [
  {
    name: "Basic Profile",
    price: "₹5,000/mo",
    features: ["Business listing", "Contact & hours", "Map embed"],
    highlight: false,
  },
  {
    name: "Growth",
    price: "₹20,000/mo",
    features: [
      "Featured placement",
      "Offer & event posts",
      "Banner ads",
      "Analytics",
    ],
    highlight: true,
  },
  {
    name: "Premium Brand",
    price: "₹50,000/mo",
    features: [
      "Homepage sponsorship",
      "Event co-branding",
      "Sponsored articles",
      "Site-wide display ads",
    ],
    highlight: false,
  },
];

const DATA_PRODUCTS = [
  {
    name: "Investor Dashboard",
    price: "₹50,000/yr",
    desc: "Price heatmaps, rental yield data, appreciation trends.",
    users: "Investors, HNIs",
  },
  {
    name: "Developer Analytics",
    price: "₹1,50,000/yr",
    desc: "Inventory velocity, lead quality, competitive benchmarks.",
    users: "Developers",
  },
  {
    name: "Institutional Reports",
    price: "Custom",
    desc: "Quarterly district reports for PE funds, REITs, banks.",
    users: "PE Funds, Banks, NBFCs",
  },
];

const TIMELINE = [
  { phase: "Day 1", items: ["Developer listings", "Rental listings", "Ad placements"] },
  { phase: "Month 3", items: ["Sponsored content", "Premium features", "Newsletter"] },
  { phase: "Month 6", items: ["Resident services", "Vendor commissions", "Memberships"] },
  { phase: "Year 2", items: ["Data SaaS", "API products", "Institutional reports"] },
];

// ─── Page ────────────────────────────────────────────────────────────────────

export default function AdvertisePage() {
  return (
    <>
      {/* ── Hero ── */}
      <section className="bg-gradient-to-br from-accent-600 to-orange-700 text-white py-16 md:py-24">
        <SectionWrapper tight>
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 bg-white/10 text-white text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
              <TrendingUp className="w-3.5 h-3.5" />
              Monetisation & Partnership Plans
            </span>
            <h1 className="text-3xl md:text-5xl font-extrabold mt-2 mb-4">
              Grow With the{" "}
              <span className="text-yellow-300">Neopolis Platform</span>
            </h1>
            <p className="text-orange-100 text-lg mb-6 max-w-2xl">
              12,000+ buyers, tenants, residents, and investors. One hyper-local
              platform. Six revenue streams ready to work for your business
              from day one.
            </p>
            <div className="flex flex-wrap gap-3">
              <a href="#developer-plans" className="bg-white text-accent-600 font-bold px-5 py-2.5 rounded-lg hover:bg-orange-50 transition-colors inline-flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                Developer Plans
              </a>
              <a href="#contact" className="border-2 border-white text-white font-bold px-5 py-2.5 rounded-lg hover:bg-white/10 transition-colors inline-flex items-center gap-2">
                Talk to Sales <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </SectionWrapper>
      </section>

      {/* ── Audience Stats ── */}
      <section className="bg-white border-b border-gray-100">
        <SectionWrapper tight>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { value: "12,000+", label: "Registered Users" },
              { value: "45,000+", label: "Monthly Page Views" },
              { value: "330+", label: "Active Listings" },
              { value: "231+", label: "Businesses Listed" },
            ].map((s) => (
              <div key={s.label}>
                <div className="text-3xl font-extrabold text-gray-900">{s.value}</div>
                <div className="text-sm text-gray-500 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </SectionWrapper>
      </section>

      {/* ── Partner Segments ── */}
      <SectionWrapper id="segments">
        <div className="text-center mb-10">
          <h2 className="section-heading">Who Advertises on NeopolisNews</h2>
          <p className="text-gray-500 mt-2">Six partner categories — each with dedicated revenue streams.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {SEGMENTS.map((s) => (
            <div key={s.title} className="card p-5 flex gap-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${s.color}`}>
                <s.icon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-sm">{s.title}</h3>
                <p className="text-xs text-gray-500 mt-0.5 mb-1">{s.desc}</p>
                <span className="text-xs font-bold text-brand-700">{s.value}</span>
              </div>
            </div>
          ))}
        </div>
      </SectionWrapper>

      {/* ── Developer Plans ── */}
      <section className="bg-gray-50" id="developer-plans">
        <SectionWrapper>
          <div className="text-center mb-10">
            <h2 className="section-heading">Developer Listing Plans</h2>
            <p className="text-gray-500 mt-2">
              Put your project in front of India&apos;s most qualified buyers.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-5 max-w-5xl mx-auto">
            {DEVELOPER_PLANS.map((plan) => (
              <div
                key={plan.name}
                className={`card p-6 flex flex-col ${plan.highlight ? "ring-2 ring-brand-500 relative" : ""}`}
              >
                {plan.badge && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                    {plan.badge}
                  </span>
                )}
                <div className="mb-4">
                  <h3 className="font-bold text-xl text-gray-900 mb-0.5">{plan.name}</h3>
                  <p className="text-xs text-gray-400">{plan.subtitle}</p>
                </div>
                <div className="mb-5">
                  <span className="text-4xl font-extrabold text-brand-700">{plan.price}</span>
                  <span className="text-gray-400 text-sm">{plan.period}</span>
                </div>
                <ul className="space-y-2 mb-6 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <a
                  href="#contact"
                  className={`block text-center font-semibold py-2.5 rounded-lg text-sm transition-colors ${
                    plan.highlight
                      ? "bg-brand-600 text-white hover:bg-brand-700"
                      : "border border-brand-300 text-brand-600 hover:bg-brand-50"
                  }`}
                >
                  {plan.cta}
                </a>
              </div>
            ))}
          </div>
        </SectionWrapper>
      </section>

      {/* ── Retail Plans ── */}
      <SectionWrapper id="retail-plans">
        <div className="text-center mb-10">
          <h2 className="section-heading">Retail & Brand Plans</h2>
          <p className="text-gray-500 mt-2">
            Reach shoppers, residents, and office workers in Neopolis.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-5 max-w-4xl mx-auto">
          {RETAIL_PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`card p-6 ${plan.highlight ? "ring-2 ring-purple-500 relative" : ""}`}
            >
              {plan.highlight && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                  Most Popular
                </span>
              )}
              <h3 className="font-bold text-lg text-gray-900 mb-1">{plan.name}</h3>
              <p className="text-3xl font-extrabold text-purple-700 mb-4">{plan.price}</p>
              <ul className="space-y-2 mb-6">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <a
                href="#contact"
                className={`block text-center font-semibold py-2.5 rounded-lg text-sm transition-colors ${
                  plan.highlight
                    ? "bg-purple-600 text-white hover:bg-purple-700"
                    : "border border-purple-300 text-purple-600 hover:bg-purple-50"
                }`}
              >
                Get Started
              </a>
            </div>
          ))}
        </div>
      </SectionWrapper>

      {/* ── Data Products ── */}
      <section className="bg-gray-50" id="data">
        <SectionWrapper>
          <div className="text-center mb-10">
            <h2 className="section-heading">Data & Analytics Products</h2>
            <p className="text-gray-500 mt-2">
              Price heatmaps, rental yields, occupancy analytics — for investors and institutions.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-5 max-w-4xl mx-auto">
            {DATA_PRODUCTS.map((p) => (
              <div key={p.name} className="card p-6">
                <BarChart3 className="w-8 h-8 text-brand-500 mb-3" />
                <h3 className="font-bold text-gray-900 mb-1">{p.name}</h3>
                <p className="text-2xl font-extrabold text-brand-700 mb-2">{p.price}</p>
                <p className="text-sm text-gray-500 mb-3">{p.desc}</p>
                <span className="text-xs bg-brand-50 text-brand-700 px-2 py-1 rounded-full font-medium">
                  {p.users}
                </span>
              </div>
            ))}
          </div>
          <p className="text-center text-sm text-gray-400 mt-6">
            Data products launch Year 2. Join the waitlist below.
          </p>
        </SectionWrapper>
      </section>

      {/* ── Revenue Timeline ── */}
      <SectionWrapper id="timeline">
        <div className="text-center mb-10">
          <h2 className="section-heading">Revenue Activation Timeline</h2>
          <p className="text-gray-500 mt-2">
            Multiple streams activate progressively — strong from day one.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {TIMELINE.map((t) => (
            <div key={t.phase} className="card p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center">
                  <Zap className="w-4 h-4 text-brand-600" />
                </div>
                <span className="font-bold text-brand-700 text-sm">{t.phase}</span>
              </div>
              <ul className="space-y-1.5">
                {t.items.map((item) => (
                  <li key={item} className="flex items-center gap-2 text-xs text-gray-600">
                    <CheckCircle className="w-3.5 h-3.5 text-green-500 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </SectionWrapper>

      {/* ── Value Prop ── */}
      <section className="bg-brand-950 text-white">
        <SectionWrapper tight>
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
              Why Advertise on NeopolisNews?
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { icon: Users, title: "Hyper-local Audience", desc: "100% Neopolis-focused — no wasted impressions." },
              { icon: TrendingUp, title: "High Purchase Intent", desc: "Users are actively buying, renting, or moving in." },
              { icon: Star, title: "Premium Context", desc: "Editorial trust drives ad effectiveness." },
              { icon: BarChart3, title: "Full Analytics", desc: "Views, clicks, leads — all tracked and reported." },
            ].map((v) => (
              <div key={v.title} className="text-center px-2">
                <div className="w-12 h-12 rounded-2xl bg-brand-800 flex items-center justify-center mx-auto mb-3">
                  <v.icon className="w-6 h-6 text-brand-300" />
                </div>
                <h3 className="font-bold text-white text-sm mb-1">{v.title}</h3>
                <p className="text-xs text-brand-400">{v.desc}</p>
              </div>
            ))}
          </div>
        </SectionWrapper>
      </section>

      {/* ── Contact / Lead Form ── */}
      <SectionWrapper id="contact">
        <div className="grid lg:grid-cols-2 gap-10 items-start">
          <div>
            <h2 className="section-heading mb-3">Ready to Partner?</h2>
            <p className="text-gray-500 mb-5">
              Talk to our sales team — we&apos;ll design a package that fits your
              business goals and budget.
            </p>
            <div className="space-y-4">
              {[
                { label: "Developers", value: "₹3L – ₹25L/yr" },
                { label: "Brokers", value: "₹50K – ₹2L/yr" },
                { label: "Retail Brands", value: "₹5K – ₹50K/mo" },
                { label: "Sponsored Content", value: "₹25K – ₹2L/article" },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <span className="text-sm text-gray-600 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" /> {item.label}
                  </span>
                  <span className="text-sm font-bold text-brand-700">{item.value}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-4">
              All plans include onboarding support. Custom enterprise packages available.
            </p>
          </div>
          <div className="card p-6">
            <LeadForm
              title="Contact Our Sales Team"
              subtitle="We respond within 24 hours with a custom proposal."
              purpose="advertise-sales"
            />
          </div>
        </div>
      </SectionWrapper>
    </>
  );
}
