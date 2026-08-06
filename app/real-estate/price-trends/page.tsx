import Link from "next/link";
import { ArrowLeft, MapPin, BarChart3, TrendingUp } from "lucide-react";
import SectionWrapper from "@/components/SectionWrapper";
import { createAdminClient } from "@/lib/supabase/server";
import { LOCALITIES, LIFECYCLE_STAGES, type Locality, type ProjectTier, type LifecycleStatus } from "@/lib/projectsStore";
import PriceTrendsExplorer, {
  type LocalityGroupData, type TierGroupData, type StageSeriesData,
} from "./PriceTrendsExplorer";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export const metadata = {
  title: "Price Trends – NeopolisNews",
  description:
    "₹ per sq ft by locality, tier and construction stage for every area NeopolisNews covers.",
};

const TIER_ORDER: ProjectTier[] = ["affordable", "premium", "luxury", "uber_luxury"];
const STAGE_ORDER: LifecycleStatus[] = LIFECYCLE_STAGES
  .filter((s) => s.id !== "pre_launch")
  .map((s) => s.id);

async function getPriceHistory(): Promise<LocalityGroupData[]> {
  const sb = createAdminClient();
  const { data } = await sb
    .from("locality_price_trends")
    .select("locality, tier, lifecycle_status, price, period_month")
    .order("period_month", { ascending: true });

  // locality -> tier -> stage -> points[]
  const tree = new Map<Locality, Map<ProjectTier, Map<LifecycleStatus, StageSeriesData["points"]>>>();
  for (const row of data ?? []) {
    const locality = row.locality as Locality;
    const tier = row.tier as ProjectTier;
    const stage = row.lifecycle_status as LifecycleStatus;

    if (!tree.has(locality)) tree.set(locality, new Map());
    const tierMap = tree.get(locality)!;
    if (!tierMap.has(tier)) tierMap.set(tier, new Map());
    const stageMap = tierMap.get(tier)!;
    if (!stageMap.has(stage)) stageMap.set(stage, []);
    stageMap.get(stage)!.push({ month: row.period_month as string, price: Number(row.price) });
  }

  return LOCALITIES
    .filter((l) => tree.has(l))
    .map((locality): LocalityGroupData => {
      const tierMap = tree.get(locality)!;
      const tiers: TierGroupData[] = TIER_ORDER
        .filter((t) => tierMap.has(t))
        .map((tier) => {
          const stageMap = tierMap.get(tier)!;
          const stages: StageSeriesData[] = STAGE_ORDER
            .filter((s) => stageMap.has(s))
            .map((stage) => ({
              stage,
              points: [...stageMap.get(stage)!].sort((a, b) => a.month.localeCompare(b.month)),
            }));
          return { tier, stages };
        });
      return { locality, tiers };
    });
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function PriceTrendsPage() {
  const history = await getPriceHistory();

  const allCombos = history.flatMap((l) => l.tiers.flatMap((t) => t.stages));
  const combosTracked = allCombos.length;
  const latestPrices = allCombos.map((s) => s.points[s.points.length - 1].price);
  const priceMin = latestPrices.length ? Math.min(...latestPrices) : null;
  const priceMax = latestPrices.length ? Math.max(...latestPrices) : null;

  return (
    <>
      {/* ── Hero ── */}
      <section className="bg-gradient-to-br from-brand-900 to-brand-800 text-white py-14 md:py-20">
        <SectionWrapper tight>
          <Link
            href="/real-estate"
            className="inline-flex items-center gap-1.5 text-brand-300 hover:text-white text-sm mb-5 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> All Projects
          </Link>
          <div className="max-w-3xl">
            <span className="tag-blue mb-4">Real Estate Intelligence Hub</span>
            <h1 className="text-3xl md:text-5xl font-extrabold mt-3 mb-4">
              Price Trends, <span className="text-brand-400">by Area.</span>
            </h1>
            <p className="text-brand-200 text-lg mb-2">
              ₹ per sq ft by locality, tier and construction stage — the three
              things that decide price, updated monthly.
            </p>
          </div>
        </SectionWrapper>
      </section>

      <SectionWrapper>
        {combosTracked > 0 && (
          <div className="grid sm:grid-cols-3 gap-5 mb-8">
            <div className="card p-5">
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="w-5 h-5 text-brand-500" />
                <h3 className="font-bold text-gray-900">Localities Tracked</h3>
              </div>
              <p className="text-3xl font-extrabold text-gray-900">{history.length}</p>
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

        <PriceTrendsExplorer data={history} defaultLocality="Neopolis" />
      </SectionWrapper>
    </>
  );
}
