import Link from "next/link";
import { GraduationCap, TrendingUp, Users, ArrowRight, Calendar, Award } from "lucide-react";
import SectionWrapper from "@/components/SectionWrapper";
import LeadForm from "@/components/LeadForm";
import PlanTierCard, { type PlanTier } from "@/components/advertise/PlanTierCard";

export const metadata = {
  title: "Advertise for Schools & Education – NeopolisNews",
  description:
    "List your school, day care, or coaching centre free on NeopolisNews — fee & grade ranges, student achievements, and campus-visit requests.",
};

const PLANS: PlanTier[] = [
  {
    name: "Basic Profile",
    future: false,
    features: ["Business listing", "Contact & hours", "Map embed", "Fee & grade range display", "Student achievements tab", "Campus visit requests"],
    cta: "Get Started — It's Free",
  },
  {
    name: "Growth",
    future: true,
    features: ["Featured placement", "Admissions campaign posts", "Analytics"],
  },
  {
    name: "Premium",
    future: true,
    features: ["Homepage sponsorship", "Sponsored articles", "Site-wide display ads"],
  },
];

export default function AdvertiseEducationPage() {
  return (
    <>
      <section className="bg-gradient-to-br from-indigo-900 to-indigo-700 text-white py-16 md:py-24">
        <SectionWrapper tight>
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 bg-white/10 text-white text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
              <TrendingUp className="w-3.5 h-3.5" /> Free While We&apos;re New
            </span>
            <h1 className="text-3xl md:text-5xl font-extrabold mt-2 mb-4">
              Reach Parents Choosing{" "}
              <span className="text-indigo-300">Schools in Neopolis</span>
            </h1>
            <p className="text-indigo-100 text-lg mb-6 max-w-2xl">
              Schools, day cares, and coaching centres — list free, showcase student
              achievements, and take campus-visit requests directly.
            </p>
            <div className="flex flex-wrap gap-3">
              <a href="#plans" className="bg-white text-indigo-700 font-bold px-5 py-2.5 rounded-lg hover:bg-indigo-50 transition-colors inline-flex items-center gap-2">
                <GraduationCap className="w-4 h-4" /> See Plans
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
            <h2 className="section-heading">Education Listing Plans</h2>
            <p className="text-gray-500 mt-2">Free to start — no commitment, no payment details needed.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-5 max-w-4xl mx-auto">
            {PLANS.map((plan) => <PlanTierCard key={plan.name} plan={plan} accentRing="ring-indigo-500" accentBg="bg-indigo-600 hover:bg-indigo-700" />)}
          </div>
        </SectionWrapper>
      </section>

      <section className="bg-indigo-950 text-white">
        <SectionWrapper tight>
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">Why Schools List Here</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { icon: Users, title: "Hyper-local Audience", desc: "Parents actively comparing schools nearby." },
              { icon: Award, title: "Student Achievements", desc: "A lighter-weight showcase than a full news article." },
              { icon: Calendar, title: "Campus Visit Requests", desc: "Same request-a-slot mechanism as appointment booking." },
              { icon: TrendingUp, title: "Fee & Grade Transparency", desc: "Structured fee/grade range builds parent trust upfront." },
            ].map((v) => (
              <div key={v.title} className="text-center px-2">
                <div className="w-12 h-12 rounded-2xl bg-indigo-800 flex items-center justify-center mx-auto mb-3">
                  <v.icon className="w-6 h-6 text-indigo-300" />
                </div>
                <h3 className="font-bold text-white text-sm mb-1">{v.title}</h3>
                <p className="text-xs text-indigo-400">{v.desc}</p>
              </div>
            ))}
          </div>
        </SectionWrapper>
      </section>

      <SectionWrapper id="contact">
        <div className="grid lg:grid-cols-2 gap-10 items-start">
          <div>
            <h2 className="section-heading mb-3">Ready to List Your School?</h2>
            <p className="text-gray-500 mb-5">Talk to our team — get listed free while the platform is new.</p>
            <p className="text-xs text-gray-400">No cards, no commitments — we&apos;ll reach out to get you onboarded.</p>
            <p className="text-sm text-gray-500 mt-5">
              Looking for other partner types?{" "}
              <Link href="/advertise" className="text-brand-600 font-semibold hover:underline">See all options</Link>
            </p>
          </div>
          <div className="card p-6">
            <LeadForm title="Talk to Our Education Team" subtitle="We respond within 24 hours." purpose="advertise-education" />
          </div>
        </div>
      </SectionWrapper>
    </>
  );
}
