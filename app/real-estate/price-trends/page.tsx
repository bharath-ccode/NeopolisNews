import Link from "next/link";
import { ArrowLeft, MapPin, BarChart3, TrendingUp } from "lucide-react";
import SectionWrapper from "@/components/SectionWrapper";
import { createAdminClient } from "@/lib/supabase/server";
import { LOCALITIES, type Locality, type ProjectTier, type LifecycleStatus } from "@/lib/projectsStore";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export const metadata = {
  title: "Price Trends – NeopolisNews",
  description:
    "₹ per sq ft by locality, tier and construction stage for every area NeopolisNews covers.",
};

// ─── Price matrix: Locality × Tier × Construction Stage (admin-curated) ──────

interface PriceCombo {
  tier: ProjectTier;
  lifecycle_status: LifecycleStatus;
  price: number;
  periodMonth: string;
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
    .select("locality, tier, lifecycle_status, price, period_month")
    .order("period_month");

  // Keep only each combination's latest month — older snapshots exist for
  // history, but the price sheet shows the current price.
  const latestByCombo = new Map<string, PriceCombo & { locality: Locality }>();
  for (const row of data ?? []) {
    const key = `${row.locality}|${row.tier}|${row.lifecycle_status}`;
    latestByCombo.set(key, {
      locality: row.locality as Locality,
      tier: row.tier as ProjectTier,
      lifecycle_status: row.lifecycle_status as LifecycleStatus,
      price: Number(row.price),
      periodMonth: row.period_month as string,
    });
  }

  const byLocality = new Map<Locality, PriceCombo[]>();
  for (const { locality, ...combo } of latestByCombo.values()) {
    const list = byLocality.get(locality) ?? [];
    list.push(combo);
    byLocality.set(locality, list);
  }
  for (const list of byLocality.values()) {
    list.sort((a, b) => a.tier.localeCompare(b.tier) || a.lifecycle_status.localeCompare(b.lifecycle_status));
  }
  return LOCALITIES
    .filter((l) => byLocality.has(l))
    .map((l) => ({ locality: l, rows: byLocality.get(l)! }));
}

function monthYear(dateStr: string): string {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-IN", { month: "short", year: "numeric" });
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function PriceTrendsPage() {
  const priceMatrix = await getPriceMatrix();
  const allPrices = priceMatrix.flatMap((l) => l.rows.map((r) => r.price));
  const combosTracked = allPrices.length;
  const priceMin = combosTracked ? Math.min(...allPrices) : null;
  const priceMax = combosTracked ? Math.max(...allPrices) : null;

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
                        <th className="px-4 py-2.5 font-semibold text-right">As of</th>
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
                          <td className="px-4 py-2.5 text-right text-xs text-gray-400 whitespace-nowrap">
                            {monthYear(r.periodMonth)}
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
    </>
  );
}
