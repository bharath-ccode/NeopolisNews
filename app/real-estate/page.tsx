import Link from "next/link";
import {
  Building2,
  ArrowRight,
  TrendingUp,
  BarChart3,
  CheckCircle,
  Users,
  ShoppingBag,
  Zap,
  MapPin,
} from "lucide-react";
import SectionWrapper from "@/components/SectionWrapper";
import LeadForm from "@/components/LeadForm";
import { createAdminClient } from "@/lib/supabase/server";
import { LOCALITIES, type Locality, type ProjectTier, type LifecycleStatus } from "@/lib/projectsStore";
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

// ─── Price matrix: Locality × Tier × Construction Stage (admin-curated) ──────

interface PriceCombo {
  tier: ProjectTier;
  lifecycle_status: LifecycleStatus;
  price: number;
}
interface LocalityPrices {
  locality: Locality;
  rows: PriceCombo[];
}

const TIER_LABELS: Record<ProjectTier, string> = {
  affordable:  "Affordable",
  premium:     "Premium",
  luxury:      "Luxury",
  uber_luxury: "Uber Luxury",
};

const STAGE_LABELS: Record<LifecycleStatus, string> = {
  pre_launch:         "Pre-Launch",
  rera_registered:    "RERA Registered",
  under_construction: "Under Construction",
  structure_complete: "Structure Complete",
  finishing:          "Finishing",
  oc_received:        "OC Received",
  ready_to_move:      "Ready to Move",
};

async function getPriceMatrix(): Promise<LocalityPrices[]> {
  const sb = createAdminClient();
  const { data } = await sb
    .from("locality_price_trends")
    .select("locality, tier, lifecycle_status, price")
    .order("tier")
    .order("lifecycle_status");

  const byLocality = new Map<Locality, PriceCombo[]>();
  for (const row of data ?? []) {
    const list = byLocality.get(row.locality as Locality) ?? [];
    list.push({
      tier: row.tier as ProjectTier,
      lifecycle_status: row.lifecycle_status as LifecycleStatus,
      price: Number(row.price),
    });
    byLocality.set(row.locality as Locality, list);
  }
  return LOCALITIES
    .filter((l) => byLocality.has(l))
    .map((l) => ({ locality: l, rows: byLocality.get(l)! }));
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function RealEstatePage() {
  const [projects, priceMatrix] = await Promise.all([getProjects(), getPriceMatrix()]);
  const allPrices = priceMatrix.flatMap((l) => l.rows.map((r) => r.price));
  const combosTracked = allPrices.length;
  const priceMin = combosTracked ? Math.min(...allPrices) : null;
  const priceMax = combosTracked ? Math.max(...allPrices) : null;

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
              ₹ per sq ft by locality, tier and construction stage — the three things that decide price
            </p>
          </div>

          {combosTracked > 0 && (
            <div className="grid sm:grid-cols-3 gap-5 mb-8">
              <div className="card p-5">
                <div className="flex items-center gap-2 mb-3">
                  <MapPin className="w-5 h-5 text-brand-500" />
                  <h3 className="font-bold text-gray-900">Localities Tracked</h3>
                </div>
                <p className="text-3xl font-extrabold text-gray-900">{priceMatrix.length}</p>
                <p className="text-xs text-gray-500 mt-0.5">of {LOCALITIES.length} covered</p>
              </div>
              <div className="card p-5">
                <div className="flex items-center gap-2 mb-3">
                  <BarChart3 className="w-5 h-5 text-blue-500" />
                  <h3 className="font-bold text-gray-900">Combinations Priced</h3>
                </div>
                <p className="text-3xl font-extrabold text-gray-900">{combosTracked}</p>
                <p className="text-xs text-gray-500 mt-0.5">tier × stage price points</p>
              </div>
              <div className="card p-5">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="w-5 h-5 text-green-500" />
                  <h3 className="font-bold text-gray-900">Price Range</h3>
                </div>
                <p className="text-3xl font-extrabold text-gray-900">
                  ₹{priceMin!.toLocaleString("en-IN")}–{priceMax!.toLocaleString("en-IN")}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">per sq ft, across all localities</p>
              </div>
            </div>
          )}

          {priceMatrix.length === 0 ? (
            <div className="card p-10 text-center text-gray-400 text-sm">
              Price data coming soon for the Neopolis district.
            </div>
          ) : (
            <div className="space-y-5">
              {priceMatrix.map(({ locality, rows }) => (
                <div key={locality} className="card overflow-hidden">
                  <div className="flex items-center gap-2 px-4 py-3 bg-white border-b border-gray-100">
                    <MapPin className="w-4 h-4 text-brand-500" />
                    <h3 className="font-bold text-gray-900 text-sm">{locality}</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-xs text-gray-400 border-b border-gray-100">
                          <th className="px-4 py-2.5 font-semibold">Tier</th>
                          <th className="px-4 py-2.5 font-semibold">Construction Stage</th>
                          <th className="px-4 py-2.5 font-semibold text-right">Price / sq ft</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rows.map((r) => (
                          <tr key={`${r.tier}-${r.lifecycle_status}`} className="border-b border-gray-50 last:border-0">
                            <td className="px-4 py-2.5 text-gray-700 whitespace-nowrap">{TIER_LABELS[r.tier]}</td>
                            <td className="px-4 py-2.5 text-gray-500 whitespace-nowrap">{STAGE_LABELS[r.lifecycle_status]}</td>
                            <td className="px-4 py-2.5 text-right font-semibold text-gray-900 whitespace-nowrap">
                              ₹{r.price.toLocaleString("en-IN")}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          )}
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
