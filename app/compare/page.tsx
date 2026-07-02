import { notFound } from "next/navigation";
import Link from "next/link";
import {
  Building2, ArrowLeft, CheckCircle, X, ChevronRight,
  Tag, Layers, Users, LandPlot, Ruler, GitCompare,
} from "lucide-react";
import { createAdminClient } from "@/lib/supabase/server";
import SectionWrapper from "@/components/SectionWrapper";
import type { Project } from "@/lib/projectsStore";
import { toProject } from "@/lib/projectsStore";
import { LIFECYCLE_STAGES } from "@/lib/projectsStore";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

// ─── Data fetch ───────────────────────────────────────────────────────────────

async function fetchProject(id: string): Promise<Project | null> {
  const sb = createAdminClient();
  const { data } = await sb
    .from("projects")
    .select(
      `*, builders(builder_name),
      contacts(id, email, website, project_owner, facebook_url, instagram_url, youtube_url,
        contact_phones(id, phone_number, role, sort_order)
      ),
      project_details(id, num_towers, max_floors, amenities_sqft,
        towers(id, tower_name, num_floors, sort_order,
          tower_unit_plans(id, project_id, unit_plan_id, floor_from, floor_to, units_per_floor, sort_order)
        )
      ),
      unit_plans(id, plan_name, bhk, maid_room, home_office, size_sqft, facing, plan_url, sort_order)`
    )
    .eq("id", id)
    .single();
  if (!data) return null;
  return toProject(data);
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const TIER_LABELS: Record<string, string> = {
  affordable: "Affordable", premium: "Premium",
  luxury: "Luxury", uber_luxury: "Uber Luxury",
};
const TIER_COLORS: Record<string, string> = {
  affordable: "bg-blue-100 text-blue-700",
  premium: "bg-purple-100 text-purple-700",
  luxury: "bg-amber-100 text-amber-800",
  uber_luxury: "bg-rose-100 text-rose-800",
};
const TYPE_LABELS: Record<string, string> = {
  apartments: "Apartments", independent_homes: "Independent Homes",
  residential: "Residential", mixed_use: "Mixed Use", commercial: "Commercial",
};

function fmt(n: number | null | undefined): string {
  if (n == null) return "—";
  return n.toLocaleString("en-IN");
}

function priceLabel(min: number | null, max: number | null): string {
  if (!min && !max) return "—";
  if (min && max) return `₹${fmt(min)} – ₹${fmt(max)} /sft`;
  if (min) return `From ₹${fmt(min)} /sft`;
  return `Up to ₹${fmt(max)} /sft`;
}

// ─── Compare row ─────────────────────────────────────────────────────────────

function Row({
  label, a, b, highlight,
}: {
  label: string;
  a: React.ReactNode;
  b: React.ReactNode;
  highlight?: "a" | "b" | "both" | "none";
}) {
  return (
    <tr className="border-b border-gray-100 last:border-0">
      <td className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide w-36 shrink-0 align-top">
        {label}
      </td>
      <td className={`py-3 px-4 text-sm text-gray-800 w-1/2 align-top ${
        highlight === "a" || highlight === "both" ? "font-bold text-green-700" : ""
      }`}>
        {a}
      </td>
      <td className={`py-3 px-4 text-sm text-gray-800 w-1/2 align-top ${
        highlight === "b" || highlight === "both" ? "font-bold text-green-700" : ""
      }`}>
        {b}
      </td>
    </tr>
  );
}

function SectionHeader({ label }: { label: string }) {
  return (
    <tr className="bg-gray-50">
      <td colSpan={3} className="py-2 px-4 text-xs font-bold text-gray-400 uppercase tracking-widest">
        {label}
      </td>
    </tr>
  );
}

// ─── Project header card ──────────────────────────────────────────────────────

function ProjectHeader({ p, side }: { p: Project; side: "a" | "b" }) {
  const status = (p as unknown as { lifecycle_status?: string }).lifecycle_status as string | undefined;
  const statusLabel = status ? LIFECYCLE_STAGES.find(s => s.id === status)?.label : null;

  return (
    <div className={`flex-1 card p-5 text-center border-t-4 ${
      side === "a" ? "border-indigo-500" : "border-purple-500"
    }`}>
      <div className="h-20 flex items-center justify-center mb-3">
        {p.projectLogoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={p.projectLogoUrl} alt={p.projectName} className="h-16 w-auto max-w-full object-contain" />
        ) : (
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
            side === "a" ? "bg-indigo-50" : "bg-purple-50"
          }`}>
            <Building2 className={`w-8 h-8 ${side === "a" ? "text-indigo-400" : "text-purple-400"}`} />
          </div>
        )}
      </div>
      <div className={`text-xs font-bold mb-1 ${side === "a" ? "text-indigo-600" : "text-purple-600"}`}>
        Project {side === "a" ? "A" : "B"}
      </div>
      <h2 className="font-extrabold text-gray-900 text-base leading-snug mb-1">{p.projectName}</h2>
      {p.builderName && (
        <p className="text-xs text-gray-400 mb-2">by {p.builderName}</p>
      )}
      <div className="flex flex-wrap items-center justify-center gap-1.5 mt-2">
        {p.tier && (
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${TIER_COLORS[p.tier] ?? ""}`}>
            {TIER_LABELS[p.tier] ?? p.tier}
          </span>
        )}
        {p.coreNeopolis && (
          <span className="flex items-center gap-0.5 text-xs font-semibold bg-brand-100 text-brand-700 px-2 py-0.5 rounded-full">
            <CheckCircle className="w-3 h-3" /> Core Neopolis
          </span>
        )}
        {statusLabel && (
          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium">
            {statusLabel}
          </span>
        )}
      </div>
      <Link
        href={`/real-estate/${p.id}`}
        className={`mt-4 flex items-center justify-center gap-1 text-xs font-semibold border py-1.5 rounded-lg transition-colors ${
          side === "a"
            ? "border-indigo-200 text-indigo-600 hover:bg-indigo-50"
            : "border-purple-200 text-purple-600 hover:bg-purple-50"
        }`}
      >
        View Full Details <ChevronRight className="w-3.5 h-3.5" />
      </Link>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function ComparePage({
  searchParams,
}: {
  searchParams: { a?: string; b?: string };
}) {
  const idA = searchParams.a;
  const idB = searchParams.b;

  if (!idA || !idB) {
    notFound();
  }

  const [projA, projB] = await Promise.all([fetchProject(idA), fetchProject(idB)]);

  if (!projA || !projB) {
    notFound();
  }

  // Pricing comparison — lower is "better" for buyer
  const priceHighlight = (() => {
    const a = projA.priceRangeMin ?? projA.priceRangeMax;
    const b = projB.priceRangeMin ?? projB.priceRangeMax;
    if (!a || !b) return "none" as const;
    if (a < b) return "a" as const;
    if (b < a) return "b" as const;
    return "both" as const;
  })();

  // Collect all BHK types across both projects
  const allBhks = Array.from(
    new Set([
      ...(projA.unitPlans ?? []).map((u) => u.bhk),
      ...(projB.unitPlans ?? []).map((u) => u.bhk),
    ])
  ).sort((x, y) => x - y);

  return (
    <>
      {/* ── Header ── */}
      <section className="bg-gradient-to-br from-indigo-900 to-purple-900 text-white py-10 md:py-14">
        <SectionWrapper tight>
          <Link
            href="/real-estate"
            className="inline-flex items-center gap-1.5 text-indigo-300 hover:text-white text-sm mb-5 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Projects
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <GitCompare className="w-7 h-7 text-indigo-300" />
            <h1 className="text-2xl md:text-3xl font-extrabold">Project Comparison</h1>
          </div>
          <p className="text-indigo-300 text-sm">
            Side-by-side comparison of <strong className="text-white">{projA.projectName}</strong>
            {" vs "}
            <strong className="text-white">{projB.projectName}</strong>
          </p>
        </SectionWrapper>
      </section>

      <SectionWrapper>
        {/* ── Project header cards ── */}
        <div className="flex gap-4 mb-8">
          {/* spacer for the label column on larger screens */}
          <div className="hidden lg:block w-36 shrink-0" />
          <ProjectHeader p={projA} side="a" />
          <ProjectHeader p={projB} side="b" />
        </div>

        {/* ── Comparison table ── */}
        <div className="card overflow-hidden">
          <table className="w-full">
            <tbody>

              {/* ── Basics ── */}
              <SectionHeader label="Overview" />
              <Row
                label="Type"
                a={projA.projectType ? TYPE_LABELS[projA.projectType] ?? projA.projectType : "—"}
                b={projB.projectType ? TYPE_LABELS[projB.projectType] ?? projB.projectType : "—"}
              />
              <Row
                label="Builder"
                a={projA.builderName ?? "—"}
                b={projB.builderName ?? "—"}
              />
              <Row
                label="Core Neopolis"
                a={projA.coreNeopolis ? <span className="flex items-center gap-1 text-green-600"><CheckCircle className="w-3.5 h-3.5" /> Yes</span> : <span className="flex items-center gap-1 text-gray-400"><X className="w-3.5 h-3.5" /> No</span>}
                b={projB.coreNeopolis ? <span className="flex items-center gap-1 text-green-600"><CheckCircle className="w-3.5 h-3.5" /> Yes</span> : <span className="flex items-center gap-1 text-gray-400"><X className="w-3.5 h-3.5" /> No</span>}
              />

              {/* ── Pricing ── */}
              <SectionHeader label="Pricing" />
              <Row
                label="Price Range"
                a={<span className="flex items-center gap-1"><Tag className="w-3.5 h-3.5 text-brand-500" />{priceLabel(projA.priceRangeMin, projA.priceRangeMax)}</span>}
                b={<span className="flex items-center gap-1"><Tag className="w-3.5 h-3.5 text-brand-500" />{priceLabel(projB.priceRangeMin, projB.priceRangeMax)}</span>}
                highlight={priceHighlight}
              />
              <Row
                label="Tier"
                a={projA.tier ? <span className={`inline text-xs font-semibold px-2 py-0.5 rounded-full ${TIER_COLORS[projA.tier] ?? ""}`}>{TIER_LABELS[projA.tier] ?? projA.tier}</span> : "—"}
                b={projB.tier ? <span className={`inline text-xs font-semibold px-2 py-0.5 rounded-full ${TIER_COLORS[projB.tier] ?? ""}`}>{TIER_LABELS[projB.tier] ?? projB.tier}</span> : "—"}
              />

              {/* ── Scale ── */}
              <SectionHeader label="Scale & Land" />
              <Row
                label={<span className="flex items-center gap-1"><LandPlot className="w-3.5 h-3.5" /> Land Area</span>}
                a={projA.totalLandAreaAcres ? `${projA.totalLandAreaAcres} acres` : "—"}
                b={projB.totalLandAreaAcres ? `${projB.totalLandAreaAcres} acres` : "—"}
                highlight={
                  projA.totalLandAreaAcres && projB.totalLandAreaAcres
                    ? projA.totalLandAreaAcres > projB.totalLandAreaAcres ? "a" : projA.totalLandAreaAcres < projB.totalLandAreaAcres ? "b" : "both"
                    : "none"
                }
              />
              <Row
                label={<span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> Total Units</span>}
                a={fmt(projA.totalUnits)}
                b={fmt(projB.totalUnits)}
              />
              <Row
                label={<span className="flex items-center gap-1"><Layers className="w-3.5 h-3.5" /> Towers</span>}
                a={fmt(projA.projectDetail?.numTowers ?? null)}
                b={fmt(projB.projectDetail?.numTowers ?? null)}
              />
              <Row
                label="Max Floors"
                a={fmt(projA.projectDetail?.maxFloors ?? null)}
                b={fmt(projB.projectDetail?.maxFloors ?? null)}
              />
              <Row
                label={<span className="flex items-center gap-1"><Ruler className="w-3.5 h-3.5" /> Amenities</span>}
                a={projA.projectDetail?.amenitiesSqft ? `${fmt(projA.projectDetail.amenitiesSqft)} sqft` : "—"}
                b={projB.projectDetail?.amenitiesSqft ? `${fmt(projB.projectDetail.amenitiesSqft)} sqft` : "—"}
                highlight={
                  projA.projectDetail?.amenitiesSqft && projB.projectDetail?.amenitiesSqft
                    ? projA.projectDetail.amenitiesSqft > projB.projectDetail.amenitiesSqft ? "a" : "b"
                    : "none"
                }
              />

              {/* ── Unit Plans ── */}
              {allBhks.length > 0 && (
                <>
                  <SectionHeader label="Unit Plans" />
                  {allBhks.map((bhk) => {
                    const plansA = (projA.unitPlans ?? []).filter((u) => u.bhk === bhk);
                    const plansB = (projB.unitPlans ?? []).filter((u) => u.bhk === bhk);

                    function renderPlans(plans: typeof plansA) {
                      if (plans.length === 0) return <span className="text-gray-400">—</span>;
                      return (
                        <div className="space-y-1">
                          {plans.map((u, i) => (
                            <div key={i} className="text-xs">
                              <span className="font-semibold text-gray-800">{u.sizeSqft.toLocaleString("en-IN")} sqft</span>
                              {u.facing && <span className="text-gray-400 ml-1">· {u.facing}</span>}
                              {u.maidRoom && <span className="text-gray-400 ml-1">· Maid room</span>}
                              {u.homeOffice && <span className="text-gray-400 ml-1">· Home office</span>}
                            </div>
                          ))}
                        </div>
                      );
                    }

                    return (
                      <Row
                        key={bhk}
                        label={`${bhk} BHK`}
                        a={renderPlans(plansA)}
                        b={renderPlans(plansB)}
                      />
                    );
                  })}
                </>
              )}

            </tbody>
          </table>
        </div>

        {/* ── CTA ── */}
        <div className="mt-8 flex flex-wrap gap-4 justify-center">
          <Link
            href={`/real-estate/${projA.id}`}
            className="flex items-center gap-2 bg-indigo-600 text-white font-semibold px-6 py-3 rounded-xl text-sm hover:bg-indigo-700 transition-colors"
          >
            <Building2 className="w-4 h-4" /> View {projA.projectName}
          </Link>
          <Link
            href={`/real-estate/${projB.id}`}
            className="flex items-center gap-2 bg-purple-600 text-white font-semibold px-6 py-3 rounded-xl text-sm hover:bg-purple-700 transition-colors"
          >
            <Building2 className="w-4 h-4" /> View {projB.projectName}
          </Link>
          <Link
            href="/real-estate"
            className="flex items-center gap-2 border border-gray-200 text-gray-600 font-semibold px-6 py-3 rounded-xl text-sm hover:border-gray-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to All Projects
          </Link>
        </div>
      </SectionWrapper>
    </>
  );
}
