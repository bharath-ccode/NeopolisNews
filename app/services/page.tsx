import Link from "next/link";
import {
  Truck,
  Paintbrush,
  Wrench,
  Wifi,
  Users,
  Building2,
  CheckCircle,
  ArrowRight,
  Star,
  Phone,
} from "lucide-react";
import SectionWrapper from "@/components/SectionWrapper";
import LeadForm from "@/components/LeadForm";

export const metadata = {
  title: "Resident & Business Services – NeopolisNews",
  description:
    "Move-in concierge, interior design, utilities setup, and facility management services for Neopolis residents and businesses.",
};

const SERVICE_CATEGORIES = [
  {
    id: "concierge",
    icon: Truck,
    title: "Move-In Concierge",
    desc: "End-to-end support when you move into Neopolis — from packers & movers to utility connections.",
    color: "bg-blue-50 text-blue-600",
    services: ["Packers & Movers", "Home Deep Cleaning", "Key Handover Assistance", "Society Onboarding"],
    commission: "5–10% referral fee",
  },
  {
    id: "interiors",
    icon: Paintbrush,
    title: "Interior Design & Fit-Out",
    desc: "Curated interior designers and contractors for residential and commercial spaces.",
    color: "bg-purple-50 text-purple-600",
    services: ["Turnkey Interior Design", "Modular Kitchen", "Custom Furniture", "Office Fit-Out"],
    commission: "8–15% referral fee",
  },
  {
    id: "facility",
    icon: Wrench,
    title: "Facility Management",
    desc: "AMC contracts, repair services, and preventive maintenance for your home or office.",
    color: "bg-orange-50 text-orange-600",
    services: ["AC Service & Repair", "Plumbing & Electrical", "Deep Cleaning AMC", "Pest Control"],
    commission: "10–20% referral fee",
  },
  {
    id: "utilities",
    icon: Wifi,
    title: "Utilities Setup",
    desc: "Fast-track connections for internet, DTH, electricity, gas, and solar.",
    color: "bg-green-50 text-green-600",
    services: ["Broadband (Jio/Airtel)", "DTH Setup", "Solar Panels", "Gas Pipeline"],
    commission: "Fixed referral bonus",
  },
  {
    id: "recruitment",
    icon: Users,
    title: "Workforce & Staffing",
    desc: "For office tenants in the Business Park — HR, recruitment, and flexi-staffing solutions.",
    color: "bg-red-50 text-red-600",
    services: ["Recruitment Partners", "Temp Staffing", "Payroll Services", "Background Checks"],
    commission: "Commission-based",
  },
  {
    id: "corporate",
    icon: Building2,
    title: "Corporate Services",
    desc: "Company registration, GST filing, legal agreements, and compliance for businesses.",
    color: "bg-yellow-50 text-yellow-600",
    services: ["Company Incorporation", "GST Registration", "Lease Agreements", "Compliance"],
    commission: "Fixed referral bonus",
  },
];

const FEATURED_VENDORS = [
  {
    category: "Packers & Movers",
    name: "SafeShift Neopolis",
    rating: 4.7,
    reviews: 312,
    tagline: "Trusted by 500+ Neopolis families",
    verified: true,
  },
  {
    category: "Interior Design",
    name: "Livspace — Neopolis Studio",
    rating: 4.6,
    reviews: 187,
    tagline: "Full-service modular & custom interiors",
    verified: true,
  },
  {
    category: "Home Maintenance",
    name: "UrbanClap Pro",
    rating: 4.5,
    reviews: 528,
    tagline: "AC, plumbing, electrical & cleaning",
    verified: true,
  },
  {
    category: "Solar Energy",
    name: "SunPower Neopolis",
    rating: 4.8,
    reviews: 94,
    tagline: "Rooftop solar — save up to 80% on electricity",
    verified: true,
  },
];

const MEMBERSHIP_PLANS = [
  {
    name: "Resident Basic",
    price: "Free",
    target: "All Neopolis residents",
    features: [
      "Access to vetted vendor directory",
      "1 free consultation",
      "Community helpdesk",
    ],
    highlight: false,
    cta: "Join Free",
  },
  {
    name: "Resident Plus",
    price: "₹4,999/yr",
    target: "Regular service users",
    features: [
      "Priority vendor booking",
      "10% off all referral services",
      "Move-in package discount",
      "Dedicated helpdesk",
    ],
    highlight: true,
    cta: "Get Plus",
  },
  {
    name: "Business",
    price: "₹12,999/yr",
    target: "Office & retail tenants",
    features: [
      "All Plus features",
      "Corporate service partners",
      "Facility management AMC",
      "Compliance assistance",
      "Bulk booking rates",
    ],
    highlight: false,
    cta: "Get Business",
  },
];

export default function ServicesPage() {
  return (
    <>
      {/* ── Hero ── */}
      <section className="bg-gradient-to-br from-slate-900 to-slate-700 text-white py-14 md:py-20">
        <SectionWrapper tight>
          <div className="max-w-3xl">
            <span className="tag-blue mb-4">Resident & Business Services</span>
            <h1 className="text-3xl md:text-5xl font-extrabold mt-3 mb-4">
              Everything You Need to{" "}
              <span className="text-brand-400">Settle In</span>
            </h1>
            <p className="text-slate-300 text-lg mb-6">
              Move-in concierge, curated interior designers, utility connections,
              and facility management — all vetted and curated for Neopolis.
            </p>
            <div className="flex flex-wrap gap-3">
              <a href="#categories" className="btn-primary">
                Browse Services
              </a>
              <Link href="/advertise#vendors" className="btn-secondary border-slate-500 text-slate-300 hover:bg-slate-700">
                List Your Service <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </SectionWrapper>
      </section>

      {/* ── Service Categories ── */}
      <SectionWrapper id="categories">
        <div className="text-center mb-10">
          <h2 className="section-heading">Service Categories</h2>
          <p className="text-gray-500 mt-2">
            Curated, verified service providers for every need.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {SERVICE_CATEGORIES.map((cat) => (
            <div key={cat.id} id={cat.id} className="card p-5">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${cat.color}`}>
                <cat.icon className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">{cat.title}</h3>
              <p className="text-sm text-gray-500 mb-4 leading-relaxed">{cat.desc}</p>
              <ul className="space-y-1 mb-4">
                {cat.services.map((s) => (
                  <li key={s} className="flex items-center gap-2 text-xs text-gray-600">
                    <CheckCircle className="w-3.5 h-3.5 text-green-500 shrink-0" />
                    {s}
                  </li>
                ))}
              </ul>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded">
                  {cat.commission}
                </span>
                <button className="text-brand-600 text-xs font-semibold hover:text-brand-700 flex items-center gap-1">
                  View Vendors <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </SectionWrapper>

      {/* ── Featured Vendors ── */}
      <section className="bg-gray-50">
        <SectionWrapper>
          <h2 className="section-heading mb-8">Featured Vendors</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {FEATURED_VENDORS.map((v) => (
              <div key={v.name} className="card p-4 text-center">
                <div className="w-14 h-14 rounded-2xl bg-brand-100 flex items-center justify-center mx-auto mb-3">
                  <Wrench className="w-7 h-7 text-brand-400" />
                </div>
                <span className="text-xs text-gray-400 font-medium block mb-1">{v.category}</span>
                <h3 className="font-bold text-gray-900 text-sm mb-1">{v.name}</h3>
                <p className="text-xs text-gray-500 mb-2 leading-snug">{v.tagline}</p>
                <div className="flex items-center justify-center gap-1 mb-3">
                  <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                  <span className="text-xs font-semibold text-gray-700">{v.rating}</span>
                  <span className="text-xs text-gray-400">({v.reviews})</span>
                </div>
                {v.verified && (
                  <span className="flex items-center justify-center gap-1 text-xs text-green-600 mb-3">
                    <CheckCircle className="w-3.5 h-3.5" /> Verified
                  </span>
                )}
                <button className="flex items-center justify-center gap-1.5 w-full border border-gray-200 hover:border-brand-400 text-gray-600 hover:text-brand-700 text-xs font-semibold py-2 rounded-lg transition-colors">
                  <Phone className="w-3.5 h-3.5" /> Contact
                </button>
              </div>
            ))}
          </div>
        </SectionWrapper>
      </section>

      {/* ── Membership Plans ── */}
      <SectionWrapper id="membership">
        <div className="text-center mb-10">
          <h2 className="section-heading">Membership Plans</h2>
          <p className="text-gray-500 mt-2">
            Unlock priority access, discounts, and dedicated support.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-5 max-w-4xl mx-auto">
          {MEMBERSHIP_PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`card p-6 ${plan.highlight ? "ring-2 ring-brand-500 relative" : ""}`}
            >
              {plan.highlight && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                  Most Popular
                </span>
              )}
              <h3 className="font-bold text-lg text-gray-900 mb-0.5">{plan.name}</h3>
              <p className="text-xs text-gray-400 mb-3">{plan.target}</p>
              <p className="text-3xl font-extrabold text-brand-700 mb-4">{plan.price}</p>
              <ul className="space-y-2 mb-6">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/advertise"
                className={`block text-center font-semibold py-2.5 rounded-lg text-sm transition-colors ${
                  plan.highlight
                    ? "bg-brand-600 text-white hover:bg-brand-700"
                    : "border border-brand-300 text-brand-600 hover:bg-brand-50"
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </SectionWrapper>

      {/* ── Vendor Registration CTA ── */}
      <section className="bg-brand-950 text-white">
        <SectionWrapper>
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
                Are You a Service Provider?
              </h2>
              <p className="text-brand-300 mb-5">
                Get listed in the Neopolis Services directory and receive
                qualified leads from verified residents and businesses.
              </p>
              <ul className="space-y-2 text-sm text-brand-200">
                {[
                  "Zero upfront cost to list",
                  "Pay only on successful referrals",
                  "Verified Vendor badge",
                  "Direct enquiry via WhatsApp & call",
                  "Analytics on profile views",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-brand-900 rounded-2xl border border-brand-700 p-6">
              <LeadForm
                title="Register as a Vendor"
                subtitle="Tell us about your service and we'll get you listed."
                purpose="vendor-registration"
                dark
              />
            </div>
          </div>
        </SectionWrapper>
      </section>
    </>
  );
}
