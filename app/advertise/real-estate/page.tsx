import Link from "next/link";
import {
  Building2, CheckCircle, TrendingUp, Users, ArrowRight, ShieldCheck,
  LayoutList, Calendar, BarChart3,
} from "lucide-react";
import SectionWrapper from "@/components/SectionWrapper";
import LeadForm from "@/components/LeadForm";
import PlanTierCard, { type PlanTier } from "@/components/advertise/PlanTierCard";

export const metadata = {
  title: "Advertise for Developers – NeopolisNews",
  description:
    "List your project free on NeopolisNews — real buyer leads, full control via your own login, no pricing shown on competitors' pages.",
};

const DEVELOPER_PLANS: PlanTier[] = [
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

const REASSURANCES = [
  {
    icon: ShieldCheck,
    title: "You're in control",
    desc: "Manage your own project page, pricing, availability and updates anytime through your own login — nothing changes without you.",
  },
  {
    icon: LayoutList,
    title: "Comparison is fair, not one-sided",
    desc: "Every project on the platform is shown the same way — specs, price, amenities, stage of construction. Buyers compare projects whether you list or not; this way the comparison is accurate and includes you.",
  },
  {
    icon: Calendar,
    title: "Real leads, not just a listing",
    desc: "Site-visit bookings, project enquiries, and saved-search alerts land directly with you — buyers actively house-hunting, not cold traffic.",
  },
  {
    icon: BarChart3,
    title: "Your own price history",
    desc: "Upload your price sheet as it updates through each phase, and build a verifiable record of your project's pricing over time — useful for your own records as much as for buyers.",
  },
];

export default function AdvertiseRealEstatePage() {
  return (
    <>
      <section className="bg-gradient-to-br from-brand-950 to-brand-800 text-white py-16 md:py-24">
        <SectionWrapper tight>
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 bg-white/10 text-white text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
              <TrendingUp className="w-3.5 h-3.5" /> Free While We&apos;re New
            </span>
            <h1 className="text-3xl md:text-5xl font-extrabold mt-2 mb-4">
              Get Your Project In Front of{" "}
              <span className="text-amber-400">Real Buyers</span>
            </h1>
            <p className="text-brand-200 text-lg mb-6 max-w-2xl">
              A dedicated project page, real site-visit and enquiry leads, and full control
              over your own listing — free to start, no cards, no catch.
            </p>
            <div className="flex flex-wrap gap-3">
              <a href="#plans" className="bg-white text-brand-800 font-bold px-5 py-2.5 rounded-lg hover:bg-brand-50 transition-colors inline-flex items-center gap-2">
                <Building2 className="w-4 h-4" /> See Plans
              </a>
              <a href="#contact" className="border-2 border-white text-white font-bold px-5 py-2.5 rounded-lg hover:bg-white/10 transition-colors inline-flex items-center gap-2">
                Talk to Sales <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </SectionWrapper>
      </section>

      {/* ── Reassurances (address the real objections developers raise) ── */}
      <SectionWrapper>
        <div className="text-center mb-10">
          <h2 className="section-heading">Before You Ask — Here&apos;s What Developers Want to Know</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-5">
          {REASSURANCES.map((r) => (
            <div key={r.title} className="card p-5 flex gap-4">
              <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
                <r.icon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-sm">{r.title}</h3>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">{r.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </SectionWrapper>

      {/* ── Plans ── */}
      <section className="bg-gray-50" id="plans">
        <SectionWrapper>
          <div className="text-center mb-10">
            <h2 className="section-heading">Developer Listing Plans</h2>
            <p className="text-gray-500 mt-2">Free to start — no commitment, no payment details needed.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-5 max-w-5xl mx-auto">
            {DEVELOPER_PLANS.map((plan) => <PlanTierCard key={plan.name} plan={plan} />)}
          </div>
        </SectionWrapper>
      </section>

      {/* ── Value prop ── */}
      <section className="bg-brand-950 text-white">
        <SectionWrapper tight>
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">Why Developers List Here</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { icon: Users, title: "Hyper-local Audience", desc: "100% Neopolis-focused buyers — no wasted impressions." },
              { icon: TrendingUp, title: "High Purchase Intent", desc: "Structured buyer-interest signals: area, budget, configuration." },
              { icon: Calendar, title: "Site Visits & Enquiries", desc: "Booked and routed straight to you, no middleman." },
              { icon: ShieldCheck, title: "Self-Managed", desc: "Your login, your updates, your pricing — always." },
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

      {/* ── Contact ── */}
      <SectionWrapper id="contact">
        <div className="grid lg:grid-cols-2 gap-10 items-start">
          <div>
            <h2 className="section-heading mb-3">Ready to List Your Project?</h2>
            <p className="text-gray-500 mb-5">
              Talk to our team — get listed free while the platform is new.
            </p>
            <p className="text-xs text-gray-400">
              No cards, no commitments — we&apos;ll reach out to get you onboarded.
            </p>
            <p className="text-sm text-gray-500 mt-5">
              Looking for other partner types?{" "}
              <Link href="/advertise" className="text-brand-600 font-semibold hover:underline">See all options</Link>
            </p>
          </div>
          <div className="card p-6">
            <LeadForm
              title="Talk to Our Real Estate Team"
              subtitle="We respond within 24 hours."
              purpose="advertise-real-estate"
            />
          </div>
        </div>
      </SectionWrapper>
    </>
  );
}
