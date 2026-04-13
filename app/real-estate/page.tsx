"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Building2,
  ArrowRight,
  TrendingUp,
  BarChart3,
  CheckCircle,
  Star,
  ChevronRight,
  Tag,
  Loader2,
} from "lucide-react";
import SectionWrapper from "@/components/SectionWrapper";
import LeadForm from "@/components/LeadForm";
import { getProjects, type Project, type ProjectType, type ProjectTier } from "@/lib/projectsStore";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const TYPE_LABELS: Record<ProjectType, string> = {
  apartments:        "Apartments",
  independent_homes: "Independent Homes",
  residential:       "Residential",
  mixed_use:         "Mixed Use",
  commercial:        "Commercial",
};

const TIER_LABELS: Record<ProjectTier, string> = {
  affordable:  "Affordable",
  premium:     "Premium",
  luxury:      "Luxury",
  uber_luxury: "Uber Luxury",
};

const TIER_COLORS: Record<ProjectTier, string> = {
  affordable:  "tag-blue",
  premium:     "tag-purple",
  luxury:      "bg-amber-100 text-amber-800 text-xs font-semibold px-2 py-0.5 rounded-full",
  uber_luxury: "bg-rose-100 text-rose-800 text-xs font-semibold px-2 py-0.5 rounded-full",
};

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

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function RealEstatePage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    getProjects()
      .then(setProjects)
      .finally(() => setLoading(false));
  }, []);

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
              Project pages, unit plans, price history, and live availability
              status — all for the Neopolis district.
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
              {loading ? "Loading…" : `${projects.length} project${projects.length !== 1 ? "s" : ""} · Updated regularly`}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20 text-gray-400">
            <Loader2 className="w-6 h-6 animate-spin mr-2" />
            <span className="text-sm">Loading projects…</span>
          </div>
        ) : projects.length === 0 ? (
          <div className="card p-16 text-center">
            <Building2 className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p className="font-medium text-gray-500">No projects listed yet</p>
            <p className="text-sm text-gray-400 mt-1">Check back soon — projects are being added.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {projects.map((p) => {
              const hasPrice = p.priceRangeMin || p.priceRangeMax;
              return (
                <div key={p.id} className={`card overflow-hidden ${p.coreNeopolis ? "ring-2 ring-brand-500" : ""}`}>
                  {/* Image / logo area */}
                  <div className="h-36 bg-gradient-to-br from-brand-50 to-brand-100 flex items-center justify-center relative overflow-hidden">
                    {p.projectLogoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={p.projectLogoUrl}
                        alt={p.projectName}
                        className="h-20 w-auto object-contain"
                      />
                    ) : (
                      <Building2 className="w-12 h-12 text-brand-300" />
                    )}
                    {p.coreNeopolis && (
                      <span className="absolute top-2 left-2 flex items-center gap-1 text-xs font-semibold bg-brand-600 text-white px-2 py-0.5 rounded-full">
                        <CheckCircle className="w-3 h-3" /> Core Neopolis
                      </span>
                    )}
                  </div>

                  <div className="p-4">
                    {/* Name + tier badge */}
                    <div className="mb-2">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className="font-bold text-gray-900 text-sm leading-snug">
                          {p.projectName}
                        </h3>
                        {p.tier && (
                          <span className={TIER_COLORS[p.tier]}>
                            {TIER_LABELS[p.tier]}
                          </span>
                        )}
                      </div>
                      {p.builderName && (
                        <p className="text-xs text-gray-400">by {p.builderName}</p>
                      )}
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-gray-500 my-3">
                      {p.projectType && (
                        <span>Type: <strong className="text-gray-700">{TYPE_LABELS[p.projectType]}</strong></span>
                      )}
                      {p.totalUnits && (
                        <span>Units: <strong className="text-gray-700">{p.totalUnits.toLocaleString("en-IN")}</strong></span>
                      )}
                      {p.totalLandAreaAcres && (
                        <span>Land: <strong className="text-gray-700">{p.totalLandAreaAcres} acres</strong></span>
                      )}
                    </div>

                    {/* Price */}
                    {hasPrice && (
                      <div className="flex items-center gap-1 mb-3">
                        <Tag className="w-3.5 h-3.5 text-brand-500" />
                        <span className="text-sm font-extrabold text-brand-700">
                          {p.priceRangeMin && p.priceRangeMax
                            ? `₹${p.priceRangeMin.toLocaleString("en-IN")} – ₹${p.priceRangeMax.toLocaleString("en-IN")} /sft`
                            : p.priceRangeMin
                            ? `From ₹${p.priceRangeMin.toLocaleString("en-IN")} /sft`
                            : `Up to ₹${p.priceRangeMax!.toLocaleString("en-IN")} /sft`}
                        </span>
                      </div>
                    )}

                    <Link
                      href={`/real-estate/${p.id}`}
                      className="flex items-center justify-center gap-1 w-full border border-brand-200 text-brand-600 hover:bg-brand-50 text-sm font-semibold py-2 rounded-lg transition-colors"
                    >
                      View Details <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </SectionWrapper>

      {/* ── Price Trends ── */}
      <section className="bg-gray-50" id="prices">
        <SectionWrapper>
          <div className="mb-8">
            <h2 className="section-heading">Price Trends</h2>
            <p className="text-gray-500 text-sm mt-1">
              Residential sq ft rates, office &amp; retail lease rates — quarterly data
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
              <p className="text-xs text-green-600 font-semibold mt-2">+44% appreciation since Q1 2024</p>
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
              <p className="text-xs text-green-600 font-semibold mt-2">+32% appreciation since Q1 2024</p>
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
              <p className="text-xs text-green-600 font-semibold mt-2">+45% appreciation since Q1 2024</p>
            </div>
          </div>

          <div className="card p-5">
            <h3 className="font-bold text-gray-900 mb-4 text-sm">
              Residential Rate (₹/sq ft) — Quarterly
            </h3>
            <div className="flex items-end gap-2 h-28">
              {PRICE_TRENDS.map((d) => (
                <div key={d.quarter} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full bg-brand-500 rounded-t"
                    style={{ height: `${(d.residential / maxPrice) * 100}px` }}
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

      {/* ── Developer CTA ── */}
      <section className="bg-brand-950 text-white">
        <SectionWrapper>
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold mb-3">Are You a Developer?</h2>
              <p className="text-brand-300 mb-5">
                Get your project in front of buyers and investors.
                Dedicated project pages, availability announcements, unit plans
                and verified badges build trust and drive qualified leads.
              </p>
              <ul className="space-y-2 text-sm text-brand-200">
                {[
                  "Dedicated project page with unit plans",
                  "Live availability announcements",
                  "Construction update publishing",
                  "Verified Developer badge",
                  "Priority listing in search results",
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
