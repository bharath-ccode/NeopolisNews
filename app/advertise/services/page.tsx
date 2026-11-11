import Link from "next/link";
import { Wrench, TrendingUp, Users, ArrowRight, Megaphone } from "lucide-react";
import SectionWrapper from "@/components/SectionWrapper";
import LeadForm from "@/components/LeadForm";
import PlanTierCard, { type PlanTier } from "@/components/advertise/PlanTierCard";

export const metadata = {
  title: "Advertise Your Local Service – NeopolisNews",
  description:
    "List your moving, party planning, home service, delivery, or driving business free on NeopolisNews — reach residents who need you right now.",
};

const PLANS: PlanTier[] = [
  {
    name: "Basic Profile",
    future: false,
    features: ["Business listing", "Contact & hours", "Map embed"],
    cta: "Get Started — It's Free",
  },
  {
    name: "Growth",
    future: true,
    features: ["Featured placement", "Offer & event posts", "Banner ads", "Analytics"],
  },
  {
    name: "Premium",
    future: true,
    features: ["Homepage sponsorship", "Event co-branding", "Sponsored articles", "Site-wide display ads"],
  },
];

export default function AdvertiseServicesPage() {
  return (
    <>
      <section className="bg-gradient-to-br from-purple-900 to-purple-700 text-white py-16 md:py-24">
        <SectionWrapper tight>
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 bg-white/10 text-white text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
              <TrendingUp className="w-3.5 h-3.5" /> Free While We&apos;re New
            </span>
            <h1 className="text-3xl md:text-5xl font-extrabold mt-2 mb-4">
              Reach Residents Who Need{" "}
              <span className="text-purple-300">Your Service Today</span>
            </h1>
            <p className="text-purple-100 text-lg mb-6 max-w-2xl">
              Movers, party planners, home services, delivery, and drivers — list free
              and show up exactly when a resident is searching for you.
            </p>
            <div className="flex flex-wrap gap-3">
              <a href="#plans" className="bg-white text-purple-700 font-bold px-5 py-2.5 rounded-lg hover:bg-purple-50 transition-colors inline-flex items-center gap-2">
                <Wrench className="w-4 h-4" /> See Plans
              </a>
              <a href="#contact" className="border-2 border-white text-white font-bold px-5 py-2.5 rounded-lg hover:bg-white/10 transition-colors inline-flex items-center gap-2">
                Talk to Sales <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </SectionWrapper>
      </section>

      <section className="bg-gray-50" id="plans">
        <SectionWrapper>
          <div className="text-center mb-10">
            <h2 className="section-heading">Local Service Listing Plans</h2>
            <p className="text-gray-500 mt-2">Free to start — no commitment, no payment details needed.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-5 max-w-4xl mx-auto">
            {PLANS.map((plan) => <PlanTierCard key={plan.name} plan={plan} accentRing="ring-purple-500" accentBg="bg-purple-600 hover:bg-purple-700" />)}
          </div>
        </SectionWrapper>
      </section>

      <section className="bg-purple-950 text-white">
        <SectionWrapper tight>
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">Why Local Services List Here</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { icon: Users, title: "Hyper-local Audience", desc: "Residents searching for your exact service nearby." },
              { icon: Megaphone, title: "Category-Specific", desc: "Shown under the subcategory residents are actually browsing." },
              { icon: TrendingUp, title: "High Intent", desc: "People searching services are ready to book, not just browsing." },
            ].map((v) => (
              <div key={v.title} className="text-center px-2">
                <div className="w-12 h-12 rounded-2xl bg-purple-800 flex items-center justify-center mx-auto mb-3">
                  <v.icon className="w-6 h-6 text-purple-300" />
                </div>
                <h3 className="font-bold text-white text-sm mb-1">{v.title}</h3>
                <p className="text-xs text-purple-400">{v.desc}</p>
              </div>
            ))}
          </div>
        </SectionWrapper>
      </section>

      <SectionWrapper id="contact">
        <div className="grid lg:grid-cols-2 gap-10 items-start">
          <div>
            <h2 className="section-heading mb-3">Ready to List Your Service?</h2>
            <p className="text-gray-500 mb-5">Talk to our team — get listed free while the platform is new.</p>
            <p className="text-xs text-gray-400">No cards, no commitments — we&apos;ll reach out to get you onboarded.</p>
            <p className="text-sm text-gray-500 mt-5">
              Looking for other partner types?{" "}
              <Link href="/advertise" className="text-brand-600 font-semibold hover:underline">See all options</Link>
            </p>
          </div>
          <div className="card p-6">
            <LeadForm title="Talk to Our Services Team" subtitle="We respond within 24 hours." purpose="advertise-services" />
          </div>
        </div>
      </SectionWrapper>
    </>
  );
}
