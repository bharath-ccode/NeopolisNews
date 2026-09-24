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
  Clock,
} from "lucide-react";
import SectionWrapper from "@/components/SectionWrapper";
import LeadForm from "@/components/LeadForm";

export const metadata = {
  title: "Advertise & Partner – NeopolisNews",
  description:
    "Developer listings, sponsored content, and partnership plans for the Neopolis urban district platform — free while the platform is new.",
};

// ─── Monetisation data (from the plan) ──────────────────────────────────────
// The platform is new — everything below is free to start. Future paid
// tiers are shown as a roadmap (no pricing committed yet), not as things
// you can buy today. The internal pricing thinking behind them still
// lives in /admin/roadmap so we come back and build it out later.

const SEGMENTS = [
  {
    icon: Building2,
    title: "Developers",
    desc: "Tier-1 and mid-size developers building in Neopolis",
    color: "bg-blue-50 text-blue-600",
  },
  {
    icon: Home,
    title: "Brokers & Agents",
    desc: "Real estate brokers looking for qualified leads",
    color: "bg-green-50 text-green-600",
  },
  {
    icon: ShoppingBag,
    title: "Retail Brands",
    desc: "Shops, F&B, entertainment, and lifestyle brands",
    color: "bg-purple-50 text-purple-600",
  },
  {
    icon: Newspaper,
    title: "Content / PR",
    desc: "Sponsored articles, press releases, and campaigns",
    color: "bg-orange-50 text-orange-600",
  },
  {
    icon: BarChart3,
    title: "Data Products",
    desc: "SaaS analytics for investors, banks, and PE funds",
    color: "bg-yellow-50 text-yellow-600",
  },
  {
    icon: Users,
    title: "Service Vendors",
    desc: "Movers, interior designers, maintenance, utilities",
    color: "bg-red-50 text-red-600",
  },
];

const DEVELOPER_PLANS = [
  {
    name: "Starter",
    subtitle: "Small developers & new projects",
    future: false,
    features: [
      "1 project page",
      "Monthly construction updates",
      "Basic inventory display",
      "Lead capture form",
      "Verified Developer badge",
      "5 featured listing slots",
    ],
    cta: "Get Started — It's Free",
  },
  {
    name: "Growth",
    subtitle: "Mid-size developers",
    future: true,
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
  },
  {
    name: "Enterprise",
    subtitle: "Tier-1 developers & large projects",
    future: true,
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
  },
];

const RETAIL_PLANS = [
  {
    name: "Basic Profile",
    future: false,
    features: ["Business listing", "Contact & hours", "Map embed"],
  },
  {
    name: "Growth",
    future: true,
    features: [
      "Featured placement",
      "Offer & event posts",
      "Banner ads",
      "Analytics",
    ],
  },
  {
    name: "Premium Brand",
    future: true,
    features: [
      "Homepage sponsorship",
      "Event co-branding",
      "Sponsored articles",
      "Site-wide display ads",
    ],
  },
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
              Free While We&apos;re New
            </span>
            <h1 className="text-3xl md:text-5xl font-extrabold mt-2 mb-4">
              Grow With the{" "}
              <span className="text-yellow-300">Neopolis Platform</span>
            </h1>
            <p className="text-orange-100 text-lg mb-6 max-w-2xl">
              12,000+ buyers, tenants, residents, and investors. One hyper-local
              platform. Get listed free while the platform is new — no cards,
              no catch.
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
          <p className="text-gray-500 mt-2">Six partner categories — all free to join while the platform is new.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {SEGMENTS.map((s) => (
            <div key={s.title} className="card p-5 flex gap-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${s.color}`}>
                <s.icon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-sm">{s.title}</h3>
                <p className="text-xs text-gray-500 mt-0.5">{s.desc}</p>
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
              Put your project in front of India&apos;s most qualified buyers — free to start.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-5 max-w-5xl mx-auto">
            {DEVELOPER_PLANS.map((plan) => (
              <div
                key={plan.name}
                className={`card p-6 flex flex-col ${plan.future ? "opacity-70" : "ring-2 ring-brand-500 relative"}`}
              >
                {!plan.future && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-green-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                    Available Now
                  </span>
                )}
                <div className="mb-4">
                  <h3 className="font-bold text-xl text-gray-900 mb-0.5">{plan.name}</h3>
                  <p className="text-xs text-gray-400">{plan.subtitle}</p>
                </div>
                <div className="mb-5">
                  {plan.future ? (
                    <span className="inline-flex items-center gap-1.5 text-gray-400 font-semibold text-sm">
                      <Clock className="w-3.5 h-3.5" /> Future — pricing not set yet
                    </span>
                  ) : (
                    <span className="text-4xl font-extrabold text-green-600">Free</span>
                  )}
                </div>
                <ul className="space-y-2 mb-6 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                {plan.future ? (
                  <span className="block text-center font-semibold py-2.5 rounded-lg text-sm bg-gray-100 text-gray-400">
                    Coming in a future phase
                  </span>
                ) : (
                  <a
                    href="#contact"
                    className="block text-center font-semibold py-2.5 rounded-lg text-sm transition-colors bg-brand-600 text-white hover:bg-brand-700"
                  >
                    {plan.cta}
                  </a>
                )}
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
            Reach shoppers, residents, and office workers in Neopolis — free to start.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-5 max-w-4xl mx-auto">
          {RETAIL_PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`card p-6 ${plan.future ? "opacity-70" : "ring-2 ring-purple-500 relative"}`}
            >
              {!plan.future && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-green-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                  Available Now
                </span>
              )}
              <h3 className="font-bold text-lg text-gray-900 mb-1">{plan.name}</h3>
              {plan.future ? (
                <span className="inline-flex items-center gap-1.5 text-gray-400 font-semibold text-sm mb-4">
                  <Clock className="w-3.5 h-3.5" /> Future — pricing not set yet
                </span>
              ) : (
                <p className="text-3xl font-extrabold text-green-600 mb-4">Free</p>
              )}
              <ul className="space-y-2 mb-6">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              {plan.future ? (
                <span className="block text-center font-semibold py-2.5 rounded-lg text-sm bg-gray-100 text-gray-400">
                  Coming in a future phase
                </span>
              ) : (
                <a
                  href="#contact"
                  className="block text-center font-semibold py-2.5 rounded-lg text-sm transition-colors bg-purple-600 text-white hover:bg-purple-700"
                >
                  Get Started — It&apos;s Free
                </a>
              )}
            </div>
          ))}
        </div>
      </SectionWrapper>

      {/* ── Data Products ── */}
      <section className="bg-gray-50" id="data">
        <SectionWrapper tight>
          <div className="max-w-xl mx-auto text-center">
            <BarChart3 className="w-10 h-10 text-brand-500 mx-auto mb-4" />
            <h2 className="text-2xl md:text-4xl font-extrabold text-gray-900 mb-3">
              Data products launch Year 2.<br className="hidden sm:block" /> Join the waitlist below.
            </h2>
            <p className="text-gray-500 mb-8">
              Price heatmaps, rental yields, and institutional reports — for investors and institutions. Not built yet, but we&apos;re tracking interest.
            </p>
            <div className="card p-6 text-left">
              <LeadForm
                title="Join the Data Products Waitlist"
                subtitle="We'll reach out when this launches."
                purpose="data-products-waitlist"
              />
            </div>
          </div>
        </SectionWrapper>
      </section>

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
              Talk to our team — get listed free while the platform is new.
            </p>
            <div className="space-y-4">
              {[
                { label: "Developers", value: "Free to start" },
                { label: "Retail Brands", value: "Free to start" },
                { label: "Brokers", value: "Coming soon" },
                { label: "Sponsored Content", value: "Coming soon" },
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
              No cards, no commitments — we&apos;ll reach out to get you onboarded.
            </p>
          </div>
          <div className="card p-6">
            <LeadForm
              title="Contact Our Sales Team"
              subtitle="We respond within 24 hours."
              purpose="advertise-sales"
            />
          </div>
        </div>
      </SectionWrapper>
    </>
  );
}
