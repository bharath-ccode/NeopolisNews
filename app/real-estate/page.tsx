import Link from "next/link";
import {
  Building2,
  ArrowRight,
  TrendingUp,
  Camera,
  BarChart3,
  CheckCircle,
  Star,
  ChevronRight,
  Shield,
  Clock,
  HardHat,
} from "lucide-react";
import SectionWrapper from "@/components/SectionWrapper";
import LeadForm from "@/components/LeadForm";
import { PROJECTS, type Project } from "@/lib/projects";

export const metadata = {
  title: "Real Estate Intelligence Hub – NeopolisNews",
  description:
    "Project pages, price trends, construction progress, floor plans and live inventory for every tower in the Neopolis urban district.",
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

// Full project lifecycle in order:
// Legal Pending → Legal Partial → Legal Complete → Under Construction → OC Received
function projectStageBadge(p: Project) {
  const hasDpa  = !!p.legalStatus.developmentPlanApproval;
  const hasRera = !!p.legalStatus.reraRegistration;
  const hasOc   = !!p.occupationCertificate;
  const constructionStarted = p.constructionMilestones.length > 0 || p.progress > 0;

  if (hasOc) {
    return { label: "OC Received", Icon: Shield, color: "text-green-700 bg-green-50 border-green-200" };
  }
  if (hasDpa && hasRera && constructionStarted) {
    return { label: "Under Construction", Icon: HardHat, color: "text-blue-700 bg-blue-50 border-blue-200" };
  }
  if (hasDpa && hasRera) {
    return { label: "Legal Complete", Icon: Shield, color: "text-green-700 bg-green-50 border-green-200" };
  }
  if (hasDpa || hasRera) {
    return { label: "Legal Partial", Icon: Clock, color: "text-yellow-700 bg-yellow-50 border-yellow-200" };
  }
  return { label: "Legal Pending", Icon: Clock, color: "text-gray-500 bg-gray-50 border-gray-200" };
}

const PRICE_TRENDS = [
  { quarter: "Q1 2024", residential: 7200, office: 82, retail: 110 },
  { quarter: "Q2 2024", residential: 7600, office: 85, retail: 118 },
  { quarter: "Q3 2024", residential: 7900, office: 88, retail: 122 },
  { quarter: "Q4 2024", residential: 8300, office: 92, retail: 130 },
  { quarter: "Q1 2025", residential: 8800, office: 95, retail: 138 },
  { quarter: "Q2 2025", residential: 9200, office: 98, retail: 145 },
  { quarter: "Q3 2025", residential: 9700, office: 102, retail: 150 },
  { quarter: "Q4 2025", residential: 10400, office: 108, retail: 160 },
];

const CONSTRUCTION_UPDATES = [
  {
    project: "Apex Tower",
    date: "March 20, 2026",
    milestone: "18th floor slab cast",
    note: "On schedule for Dec 2026 possession.",
    media: "8 new photos, 1 drone video",
  },
  {
    project: "Grand Mall",
    date: "March 15, 2026",
    milestone: "Foundation work complete",
    note: "Steel frame erection begins next week.",
    media: "12 new photos",
  },
  {
    project: "Neopolis Heights",
    date: "March 5, 2026",
    milestone: "Excavation & piling done",
    note: "Raft foundation pouring scheduled.",
    media: "6 new photos, 2 drone videos",
  },
];

// ─── Page ────────────────────────────────────────────────────────────────────

export default function RealEstatePage() {
  const maxPrice = Math.max(...PRICE_TRENDS.map((d) => d.residential));

  return (
    <>
      {/* ── Hero ── */}
      <section className="bg-gradient-to-br from-brand-900 to-brand-800 text-white py-14 md:py-20">
        <SectionWrapper tight>
          <div className="max-w-3xl">
            <span className="tag-blue mb-4">Real Estate Intelligence Hub</span>
            <h1 className="text-3xl md:text-5xl font-extrabold mt-3 mb-4">
              Every Project. Every Price.{" "}
              <span className="text-brand-400">Live.</span>
            </h1>
            <p className="text-brand-200 text-lg mb-6">
              Tower-wise project pages, monthly construction photos, drone
              videos, price history, inventory status, and floor plans —
              all for the Neopolis district.
            </p>
            <div className="flex flex-wrap gap-3">
              <a href="#projects" className="btn-primary">
                Browse Projects
              </a>
              <Link href="/advertise" className="btn-secondary border-brand-500 text-brand-300 hover:bg-brand-800">
                List Your Project <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </SectionWrapper>
      </section>

      {/* ── Projects Grid ── */}
      <SectionWrapper id="projects">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="section-heading">All Projects</h2>
            <p className="text-gray-500 text-sm mt-1">
              {PROJECTS.length} active projects · Updated weekly
            </p>
          </div>
          {/* Filters placeholder */}
          <div className="flex gap-2">
            {["All", "Residential", "Office", "Retail"].map((f) => (
              <button
                key={f}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                  f === "All"
                    ? "bg-brand-600 border-brand-600 text-white"
                    : "border-gray-200 text-gray-600 hover:border-brand-400 hover:text-brand-600"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {PROJECTS.map((p) => (
            <div
              key={p.id}
              className={`card overflow-hidden relative ${
                p.highlight ? "ring-2 ring-brand-500" : ""
              }`}
            >
              {p.sponsored && (
                <span className="absolute top-3 left-3 z-10 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-0.5 rounded-full">
                  Sponsored
                </span>
              )}
              {/* Image placeholder */}
              <div className="h-40 bg-gradient-to-br from-brand-100 to-brand-200 flex items-center justify-center relative">
                <Building2 className="w-12 h-12 text-brand-400" />
                <span className="absolute bottom-2 right-2 flex items-center gap-1 bg-black/50 text-white text-xs px-2 py-1 rounded">
                  <Camera className="w-3 h-3" /> Photos
                </span>
              </div>

              <div className="p-4">
                <div className="flex items-start justify-between mb-1">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-bold text-gray-900 text-sm truncate">
                        {p.name}
                      </h3>
                      {p.verified && (
                        <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-gray-400">{p.developer}</p>
                  </div>
                  <span className={p.statusColor}>{p.status}</span>
                </div>

                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-gray-500 my-3">
                  <span>Type: <strong className="text-gray-700">{p.type}</strong></span>
                  <span>Phase: <strong className="text-gray-700">{p.phase}</strong></span>
                  <span>Floors: <strong className="text-gray-700">{p.floors}G</strong></span>
                  <span>Size: <strong className="text-gray-700">{p.carpet}</strong></span>
                </div>

                <div className="flex items-center justify-between mb-3">
                  <span className="text-base font-extrabold text-brand-700">
                    {p.price}
                  </span>
                  <span className="text-xs text-gray-500">
                    {p.available} available
                  </span>
                </div>

                {/* Project stage badge */}
                {(() => {
                  const { label, Icon, color } = projectStageBadge(p);
                  return (
                    <div className={`flex items-center gap-1.5 text-xs font-semibold border px-2.5 py-1 rounded-full w-fit mb-3 ${color}`}>
                      <Icon className="w-3.5 h-3.5" />
                      {label}
                    </div>
                  );
                })()}

                {/* Progress */}
                <div className="mb-3">
                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>Construction</span>
                    <span>{p.progress}%</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-brand-500 rounded-full"
                      style={{ width: `${p.progress}%` }}
                    />
                  </div>
                </div>

                <div className="flex flex-wrap gap-1 mb-3">
                  {p.amenities.slice(0, 3).map((a) => (
                    <span
                      key={a}
                      className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded"
                    >
                      {a}
                    </span>
                  ))}
                  {p.amenities.length > 3 && (
                    <span className="text-xs text-gray-400">
                      +{p.amenities.length - 3} more
                    </span>
                  )}
                </div>

                <Link
                  href={`/real-estate/${p.id}`}
                  className="flex items-center justify-center gap-1 w-full border border-brand-200 text-brand-600 hover:bg-brand-50 text-sm font-semibold py-2 rounded-lg transition-colors"
                >
                  View Full Details <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </SectionWrapper>

      {/* ── Price Trends ── */}
      <section className="bg-gray-50" id="prices">
        <SectionWrapper>
          <div className="mb-8">
            <h2 className="section-heading">Price Trends</h2>
            <p className="text-gray-500 text-sm mt-1">
              Residential sq ft rates, office & retail lease rates — quarterly data
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-5 mb-8">
            <div className="card p-5">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-5 h-5 text-green-500" />
                <h3 className="font-bold text-gray-900">Residential</h3>
              </div>
              <p className="text-3xl font-extrabold text-gray-900">
                ₹{PRICE_TRENDS[PRICE_TRENDS.length - 1].residential.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">per sq ft (Q4 2025)</p>
              <p className="text-xs text-green-600 font-semibold mt-2">
                +44% appreciation since Q1 2024
              </p>
            </div>
            <div className="card p-5">
              <div className="flex items-center gap-2 mb-3">
                <BarChart3 className="w-5 h-5 text-blue-500" />
                <h3 className="font-bold text-gray-900">Grade A Office</h3>
              </div>
              <p className="text-3xl font-extrabold text-gray-900">
                ₹{PRICE_TRENDS[PRICE_TRENDS.length - 1].office}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">per sq ft / month (Q4 2025)</p>
              <p className="text-xs text-green-600 font-semibold mt-2">
                +32% appreciation since Q1 2024
              </p>
            </div>
            <div className="card p-5">
              <div className="flex items-center gap-2 mb-3">
                <Star className="w-5 h-5 text-purple-500" />
                <h3 className="font-bold text-gray-900">Retail</h3>
              </div>
              <p className="text-3xl font-extrabold text-gray-900">
                ₹{PRICE_TRENDS[PRICE_TRENDS.length - 1].retail}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">per sq ft / month (Q4 2025)</p>
              <p className="text-xs text-green-600 font-semibold mt-2">
                +45% appreciation since Q1 2024
              </p>
            </div>
          </div>

          {/* Simple chart bars */}
          <div className="card p-5">
            <h3 className="font-bold text-gray-900 mb-4 text-sm">
              Residential Rate (₹/sq ft) — Quarterly
            </h3>
            <div className="flex items-end gap-2 h-28">
              {PRICE_TRENDS.map((d) => (
                <div
                  key={d.quarter}
                  className="flex-1 flex flex-col items-center gap-1"
                >
                  <div
                    className="w-full bg-brand-500 rounded-t"
                    style={{
                      height: `${(d.residential / maxPrice) * 100}px`,
                    }}
                  />
                  <span className="text-xs text-gray-400 rotate-45 origin-left translate-x-2 hidden sm:block">
                    {d.quarter.replace(" 20", " '")}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </SectionWrapper>
      </section>

      {/* ── Construction Updates ── */}
      <SectionWrapper id="construction">
        <h2 className="section-heading mb-8">Construction Updates</h2>
        <div className="space-y-4">
          {CONSTRUCTION_UPDATES.map((u) => (
            <div key={u.project} className="card p-5 flex gap-4">
              <div className="w-10 h-10 rounded-lg bg-brand-50 flex items-center justify-center shrink-0">
                <Camera className="w-5 h-5 text-brand-500" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="font-bold text-gray-900 text-sm">
                    {u.project}
                  </span>
                  <span className="text-xs text-gray-400">{u.date}</span>
                </div>
                <p className="text-sm font-semibold text-brand-700 mb-1">
                  {u.milestone}
                </p>
                <p className="text-sm text-gray-500">{u.note}</p>
                <p className="text-xs text-blue-600 mt-1">{u.media}</p>
              </div>
            </div>
          ))}
        </div>
      </SectionWrapper>

      {/* ── Developer CTA ── */}
      <section className="bg-brand-950 text-white">
        <SectionWrapper>
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold mb-3">
                Are You a Developer?
              </h2>
              <p className="text-brand-300 mb-5">
                Get your project in front of 12,000+ buyers and investors.
                Sponsored pages, price transparency, and verified badges
                build trust and drive qualified leads.
              </p>
              <ul className="space-y-2 text-sm text-brand-200">
                {[
                  "Dedicated project page with drone video support",
                  "Monthly construction update publishing",
                  "Verified Developer badge",
                  "Priority listing in search results",
                  "Lead capture and CRM integration",
                  "Plans from ₹3 Lakhs/year",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="/advertise" className="btn-accent mt-6">
                View Developer Plans <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="bg-brand-900 rounded-2xl border border-brand-700 p-6">
              <LeadForm
                title="List Your Project"
                subtitle="Tell us about your development and we'll set up your project page."
                purpose="developer-listing"
                dark
              />
            </div>
          </div>
        </SectionWrapper>
      </section>
    </>
  );
}
