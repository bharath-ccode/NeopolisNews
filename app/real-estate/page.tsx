import Link from "next/link";
import {
  Building2,
  ArrowRight,
  BarChart3,
  CheckCircle,
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
    "Project pages, unit plans and live availability for every project in the Neopolis urban district.",
};

// ─── Server data fetch ───────────────────────────────────────────────────────

async function getProjects(): Promise<ProjectListItem[]> {
  const sb = createAdminClient();
  const { data } = await sb
    .from("projects")
    .select("id, project_name, total_land_area_acres, total_units, project_logo_url, project_type, tier, locality, lifecycle_status, price_range_min, price_range_max, builders(builder_name)")
    .order("project_name");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data ?? []).map((p: any) => ({
    ...p,
    builder_name: Array.isArray(p.builders) ? p.builders[0]?.builder_name ?? null : p.builders?.builder_name ?? null,
  }));
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function RealEstatePage() {
  const projects = await getProjects();

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
              Project pages, unit plans, and live availability status —
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
        <div className="mb-6">
          <h2 className="section-heading">All Projects</h2>
          <p className="text-gray-500 text-sm mt-1">
            {projects.length} project{projects.length !== 1 ? "s" : ""} · Updated regularly
          </p>
        </div>
        <ProjectFiltersGrid projects={projects} />
      </SectionWrapper>

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

      <section className="bg-gray-50">
        <SectionWrapper tight>
          <Link
            href="/real-estate/price-trends"
            className="card p-6 flex items-center justify-between gap-4 hover:border-brand-300 hover:shadow-md transition-all group"
          >
            <div>
              <h2 className="font-bold text-gray-900 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-brand-500" />
                Price Trends
              </h2>
              <p className="text-gray-500 text-sm mt-1">
                ₹ per sq ft by locality, tier and construction stage, updated monthly.
              </p>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-brand-600 transition-colors shrink-0" />
          </Link>
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
