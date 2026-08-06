import Link from "next/link";
import {
  Building2,
  ArrowRight,
  TrendingUp,
  BarChart3,
  CheckCircle,
  Star,
  Users,
  ShoppingBag,
  Zap,
} from "lucide-react";
import SectionWrapper from "@/components/SectionWrapper";
import LeadForm from "@/components/LeadForm";
import { createAdminClient } from "@/lib/supabase/server";
import ProjectFiltersGrid, { type ProjectListItem } from "./ProjectFiltersGrid";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export const metadata = {
  title: "Real Estate – NeopolisNews",
  description:
    "Project pages, price trends, unit plans and live availability for every project in the Neopolis urban district.",
};

// ─── Server data fetch ───────────────────────────────────────────────────────

async function getProjects(): Promise<ProjectListItem[]> {
  const sb = createAdminClient();
  const { data } = await sb
    .from("projects")
    .select("id, project_name, total_land_area_acres, total_units, core_neopolis, project_logo_url, project_type, tier, locality, lifecycle_status, price_range_min, price_range_max, builders(builder_name)")
    .order("project_name");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data ?? []).map((p: any) => ({
    ...p,
    builder_name: Array.isArray(p.builders) ? p.builders[0]?.builder_name ?? null : p.builders?.builder_name ?? null,
  }));
}

// ─── Price trend data (admin-curated in price_trends; static fallback) ───────

const FALLBACK_TRENDS = [
  { quarter: "Q1 2024", residential: 7200, office: 82, retail: 110 },
  { quarter: "Q2 2024", residential: 7600, office: 85, retail: 118 },
  { quarter: "Q3 2024", residential: 7900, office: 88, retail: 122 },
  { quarter: "Q4 2024", residential: 8300, office: 92, retail: 130 },
  { quarter: "Q1 2025", residential: 8800, office: 95, retail: 138 },
  { quarter: "Q2 2025", residential: 9200, office: 98, retail: 145 },
  { quarter: "Q3 2025", residential: 9700, office: 102, retail: 150 },
  { quarter: "Q4 2025", residential: 10400, office: 108, retail: 160 },
];

async function getPriceTrends() {
  const sb = createAdminClient();
  const { data } = await sb
    .from("price_trends")
    .select("period, period_date, segment, price")
    .order("period_date", { ascending: true });

  if (!data?.length) return FALLBACK_TRENDS;

  // Pivot rows (period x segment) into the shape the section renders
  const byPeriod = new Map<string, { quarter: string; residential: number; office: number; retail: number }>();
  for (const row of data) {
    const entry = byPeriod.get(row.period) ?? { quarter: row.period, residential: 0, office: 0, retail: 0 };
    if (row.segment === "residential") entry.residential = Number(row.price);
    if (row.segment === "office")      entry.office      = Number(row.price);
    if (row.segment === "retail")      entry.retail      = Number(row.price);
    byPeriod.set(row.period, entry);
  }
  return Array.from(byPeriod.values()).filter((e) => e.residential > 0);
}

function pctChange(first: number, last: number) {
  if (!first) return null;
  return Math.round(((last - first) / first) * 100);
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function RealEstatePage() {
  const [projects, PRICE_TRENDS] = await Promise.all([getProjects(), getPriceTrends()]);
  const maxPrice = Math.max(...PRICE_TRENDS.map((d) => d.residential));
  const first = PRICE_TRENDS[0];
  const last  = PRICE_TRENDS[PRICE_TRENDS.length - 1];
  const resChange    = pctChange(first.residential, last.residential);
  const officeChange = pctChange(first.office, last.office);
  const retailChange = pctChange(first.retail, last.retail);

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
        <div className="mb-6">
          <h2 className="section-heading">All Projects</h2>
          <p className="text-gray-500 text-sm mt-1">
            {projects.length} project{projects.length !== 1 ? "s" : ""} · Updated regularly
          </p>
        </div>
        <ProjectFiltersGrid projects={projects} />
      </SectionWrapper>

      {/* ── Price Trends ── */}
      {/* ── Why NeopolisNews Scales ── */}
      <section className="bg-gray-900 text-white">
        <SectionWrapper>
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">Why NeopolisNews Scales</h2>
            <p className="text-gray-400 max-w-xl mx-auto text-sm">The platform flywheel: each stakeholder strengthens the next.</p>
          </div>
          <div className="flex flex-col md:flex-row items-center justify-center gap-0">
            {[
              { step: "1", title: "Developers list inventory", icon: Building2 },
              { step: "2", title: "Buyers & tenants discover", icon: Users },
              { step: "3", title: "Retailers gain footfall", icon: ShoppingBag },
              { step: "4", title: "Data improves decisions", icon: BarChart3 },
              { step: "5", title: "Platform becomes indispensable", icon: Zap },
            ].map((f, i, arr) => (
              <div key={f.step} className="flex flex-col md:flex-row items-center">
                <div className="flex flex-col items-center text-center w-40 px-2">
                  <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center mb-3 ${
                    parseInt(f.step) % 2 === 1 ? "bg-amber-800/60 border-amber-500" : "bg-emerald-800/60 border-emerald-500"
                  }`}>
                    <f.icon className={`w-5 h-5 ${parseInt(f.step) % 2 === 1 ? "text-amber-300" : "text-emerald-300"}`} />
                  </div>
                  <span className={`text-xs font-bold mb-1 ${parseInt(f.step) % 2 === 1 ? "text-amber-400" : "text-emerald-400"}`}>STEP {f.step}</span>
                  <span className="text-sm font-semibold text-white leading-snug">{f.title}</span>
                </div>
                {i < arr.length - 1 && <ArrowRight className="text-gray-600 rotate-90 md:rotate-0 my-3 md:my-0 shrink-0" />}
              </div>
            ))}
          </div>
        </SectionWrapper>
      </section>

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
                ₹{last.residential.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">per sq ft ({last.quarter})</p>
              {resChange !== null && (
                <p className={`text-xs font-semibold mt-2 ${resChange >= 0 ? "text-green-600" : "text-red-500"}`}>
                  {resChange >= 0 ? "+" : ""}{resChange}% since {first.quarter}
                </p>
              )}
            </div>
            <div className="card p-5">
              <div className="flex items-center gap-2 mb-3">
                <BarChart3 className="w-5 h-5 text-blue-500" />
                <h3 className="font-bold text-gray-900">Grade A Office</h3>
              </div>
              <p className="text-3xl font-extrabold text-gray-900">
                ₹{last.office}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">per sq ft / month ({last.quarter})</p>
              {officeChange !== null && (
                <p className={`text-xs font-semibold mt-2 ${officeChange >= 0 ? "text-green-600" : "text-red-500"}`}>
                  {officeChange >= 0 ? "+" : ""}{officeChange}% since {first.quarter}
                </p>
              )}
            </div>
            <div className="card p-5">
              <div className="flex items-center gap-2 mb-3">
                <Star className="w-5 h-5 text-purple-500" />
                <h3 className="font-bold text-gray-900">Retail</h3>
              </div>
              <p className="text-3xl font-extrabold text-gray-900">
                ₹{last.retail}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">per sq ft / month ({last.quarter})</p>
              {retailChange !== null && (
                <p className={`text-xs font-semibold mt-2 ${retailChange >= 0 ? "text-green-600" : "text-red-500"}`}>
                  {retailChange >= 0 ? "+" : ""}{retailChange}% since {first.quarter}
                </p>
              )}
            </div>
          </div>

          {/* Bar chart */}
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
              <h2 className="text-2xl md:text-3xl font-bold mb-3">
                Are You a Developer?
              </h2>
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
