import Link from "next/link";
import {
  Building2,
  Stethoscope,
  GraduationCap,
  Wrench,
  Home,
  ShoppingBag,
  Newspaper,
  CheckCircle,
  TrendingUp,
  ArrowRight,
} from "lucide-react";
import SectionWrapper from "@/components/SectionWrapper";
import LeadForm from "@/components/LeadForm";

export const metadata = {
  title: "Advertise & Partner – NeopolisNews",
  description:
    "Developer listings, business directories, and partnership plans for the Neopolis urban district platform — free while the platform is new.",
};

// Each of these four verticals has its own dedicated pitch page — the fields,
// features and objections differ too much (a developer's concerns are not a
// school's) for one generic page to speak to any of them well.
const SEGMENT_PAGES = [
  {
    href: "/advertise/real-estate",
    icon: Building2,
    title: "Real Estate",
    desc: "Developers listing projects — dedicated page, site-visit & enquiry leads",
    color: "bg-blue-50 text-blue-600",
  },
  {
    href: "/advertise/health",
    icon: Stethoscope,
    title: "Health & Wellness",
    desc: "Hospitals, clinics, pharmacies, wellness studios — appointment requests",
    color: "bg-emerald-50 text-emerald-600",
  },
  {
    href: "/advertise/education",
    icon: GraduationCap,
    title: "Education",
    desc: "Schools, day cares, coaching centres — campus-visit requests",
    color: "bg-indigo-50 text-indigo-600",
  },
  {
    href: "/advertise/services",
    icon: Wrench,
    title: "Local Services",
    desc: "Movers, party planning, home services, delivery, drivers",
    color: "bg-purple-50 text-purple-600",
  },
];

// Other partner types without a dedicated page yet — same generic contact
// form as before.
const OTHER_SEGMENTS = [
  { icon: Home, title: "Brokers & Agents", desc: "Real estate brokers looking for qualified leads" },
  { icon: ShoppingBag, title: "Retail Brands", desc: "Shops, F&B, entertainment, and lifestyle brands" },
  { icon: Newspaper, title: "Content / PR", desc: "Sponsored articles, press releases, and campaigns" },
];

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

      {/* ── Segment picker ── */}
      <SectionWrapper id="segments">
        <div className="text-center mb-10">
          <h2 className="section-heading">What Are You Listing?</h2>
          <p className="text-gray-500 mt-2">Pick your category for plans and details built around what you actually need.</p>
        </div>
        <div className="grid sm:grid-cols-2 gap-4 max-w-4xl mx-auto mb-6">
          {SEGMENT_PAGES.map((s) => (
            <Link
              key={s.title}
              href={s.href}
              className="card p-5 flex gap-4 items-center hover:shadow-md hover:border-brand-200 transition-all group"
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${s.color}`}>
                <s.icon className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-gray-900">{s.title}</h3>
                <p className="text-xs text-gray-500 mt-0.5">{s.desc}</p>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-brand-600 transition-colors shrink-0" />
            </Link>
          ))}
        </div>

        <div className="max-w-4xl mx-auto">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Other partner types</p>
          <div className="grid sm:grid-cols-3 gap-4">
            {OTHER_SEGMENTS.map((s) => (
              <div key={s.title} className="card p-4 flex gap-3">
                <div className="w-9 h-9 rounded-xl bg-gray-50 text-gray-500 flex items-center justify-center shrink-0">
                  <s.icon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-sm">{s.title}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </SectionWrapper>

      {/* ── Contact / Lead Form (other partner types) ── */}
      <SectionWrapper id="contact">
        <div className="grid lg:grid-cols-2 gap-10 items-start">
          <div>
            <h2 className="section-heading mb-3">Not Sure Which Category Fits?</h2>
            <p className="text-gray-500 mb-5">
              Talk to our team — get listed free while the platform is new.
            </p>
            <div className="space-y-4">
              {[
                { label: "Real Estate", value: "Free to start" },
                { label: "Health & Wellness", value: "Free to start" },
                { label: "Education", value: "Free to start" },
                { label: "Local Services", value: "Free to start" },
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
