import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

interface ClickRow {
  business_id: string | null;
  business_name: string | null;
  movie_title: string | null;
  created_at: string;
}

/** GET — real (not simulated) ticket-intent click totals, for the
 *  investor-pitch demand-proof metric. Protected by middleware
 *  (/api/admin/*). Aggregated here in JS rather than SQL — the expected
 *  volume at this stage doesn't warrant a dedicated aggregation query. */
export async function GET() {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("ticket_click_events")
    .select("business_id, business_name, movie_title, created_at")
    .order("created_at", { ascending: false })
    .limit(5000);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const rows = (data ?? []) as ClickRow[];
  const now = Date.now();
  const DAY = 24 * 60 * 60 * 1000;

  const last7Days = rows.filter((r) => now - new Date(r.created_at).getTime() < 7 * DAY).length;
  const last30Days = rows.filter((r) => now - new Date(r.created_at).getTime() < 30 * DAY).length;

  const byBusiness = new Map<string, { business_name: string; clicks: number }>();
  const byMovie = new Map<string, number>();

  for (const r of rows) {
    if (r.business_id) {
      const key = r.business_id;
      const existing = byBusiness.get(key);
      byBusiness.set(key, {
        business_name: r.business_name ?? "Unknown",
        clicks: (existing?.clicks ?? 0) + 1,
      });
    }
    if (r.movie_title) {
      byMovie.set(r.movie_title, (byMovie.get(r.movie_title) ?? 0) + 1);
    }
  }

  const topBusinesses = [...byBusiness.entries()]
    .map(([business_id, v]) => ({ business_id, business_name: v.business_name, clicks: v.clicks }))
    .sort((a, b) => b.clicks - a.clicks)
    .slice(0, 10);

  const topMovies = [...byMovie.entries()]
    .map(([movie_title, clicks]) => ({ movie_title, clicks }))
    .sort((a, b) => b.clicks - a.clicks)
    .slice(0, 10);

  return NextResponse.json({
    totalClicks: rows.length,
    last7Days,
    last30Days,
    topBusinesses,
    topMovies,
  });
}
