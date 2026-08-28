import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { computeStats } from "@/lib/points";

export const dynamic = "force-dynamic";

/** GET ?period=month|all — top 20 earners by points, with badges.
 *  Screen names only; accounts without one show as "Anonymous". */
export async function GET(req: NextRequest) {
  const period = req.nextUrl.searchParams.get("period") === "all" ? "all" : "month";

  const admin = createAdminClient();

  let query = admin
    .from("user_points_ledger")
    .select("user_id, points, kind, source_type, created_at")
    .eq("kind", "earn")
    .gt("points", 0);

  if (period === "month") {
    const start = new Date();
    start.setDate(1);
    start.setHours(0, 0, 0, 0);
    query = query.gte("created_at", start.toISOString());
  }

  const { data: rows, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!rows?.length) return NextResponse.json([]);

  // Aggregate per user
  const byUser = new Map<string, typeof rows>();
  for (const r of rows) {
    const list = byUser.get(r.user_id) ?? [];
    list.push(r);
    byUser.set(r.user_id, list);
  }

  const totals = Array.from(byUser.entries())
    .map(([userId, entries]) => ({
      user_id: userId,
      points: entries.reduce((s, e) => s + e.points, 0),
      activities: entries.length,
    }))
    .sort((a, b) => b.points - a.points)
    .slice(0, 20);

  // Screen names (privacy: never real names)
  const { data: profiles } = await admin
    .from("user_profiles")
    .select("user_id, screen_name")
    .in("user_id", totals.map((t) => t.user_id));
  const names = new Map((profiles ?? []).map((p) => [p.user_id, p.screen_name]));

  // Badges come from the user's full history regardless of period
  let fullHistory = rows;
  if (period === "month") {
    const { data: all } = await admin
      .from("user_points_ledger")
      .select("user_id, points, kind, source_type, created_at")
      .in("user_id", totals.map((t) => t.user_id))
      .eq("kind", "earn")
      .gt("points", 0);
    fullHistory = all ?? rows;
  }
  const historyByUser = new Map<string, typeof rows>();
  for (const r of fullHistory) {
    const list = historyByUser.get(r.user_id) ?? [];
    list.push(r);
    historyByUser.set(r.user_id, list);
  }

  return NextResponse.json(
    totals.map((t, i) => ({
      rank: i + 1,
      screen_name: names.get(t.user_id) || null,
      points: t.points,
      activities: t.activities,
      badges: computeStats(historyByUser.get(t.user_id) ?? []).badges,
    }))
  );
}
