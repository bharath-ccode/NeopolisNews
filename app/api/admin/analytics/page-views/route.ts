import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

interface ViewRow {
  path: string;
  visitor_id: string;
  referrer: string | null;
  created_at: string;
}

const SOURCE_COLORS: Record<string, string> = {
  Direct:   "bg-blue-500",
  Search:   "bg-brand-500",
  Social:   "bg-purple-500",
  Referral: "bg-orange-500",
};

const SEARCH_HOSTS = ["google.", "bing.", "duckduckgo.", "yahoo."];
const SOCIAL_HOSTS = ["facebook.", "instagram.", "twitter.", "x.com", "t.co", "whatsapp.", "linkedin.", "reddit."];

function bucketReferrer(referrer: string | null): string {
  if (!referrer) return "Direct";
  let host = "";
  try { host = new URL(referrer).hostname.toLowerCase(); } catch { return "Referral"; }
  if (SEARCH_HOSTS.some((h) => host.includes(h))) return "Search";
  if (SOCIAL_HOSTS.some((h) => host.includes(h))) return "Social";
  return "Referral";
}

function localDateKey(iso: string): string {
  return new Date(iso).toLocaleDateString("en-CA"); // YYYY-MM-DD, local tz
}

/** GET ?days=7|14|30 — real page-view analytics: daily views/visitors,
 *  top pages, traffic sources (bucketed from document.referrer), and a
 *  rough session-duration estimate. Protected by middleware
 *  (/api/admin/*). Aggregated in JS rather than SQL, same as the other
 *  admin analytics routes — the expected volume doesn't warrant a
 *  dedicated aggregation query yet. */
export async function GET(req: NextRequest) {
  const days = Math.min(Math.max(parseInt(req.nextUrl.searchParams.get("days") ?? "14", 10) || 14, 1), 90);

  const since = new Date();
  since.setDate(since.getDate() - (days - 1));
  since.setHours(0, 0, 0, 0);

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("page_views")
    .select("path, visitor_id, referrer, created_at")
    .gte("created_at", since.toISOString())
    .order("created_at", { ascending: true })
    .limit(20000);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const rows = (data ?? []) as ViewRow[];

  // ─── Daily views/visitors ──────────────────────────────────────────────
  const dayBuckets = new Map<string, { views: number; visitors: Set<string> }>();
  for (let i = 0; i < days; i++) {
    const d = new Date(since);
    d.setDate(d.getDate() + i);
    dayBuckets.set(d.toLocaleDateString("en-CA"), { views: 0, visitors: new Set() });
  }
  for (const r of rows) {
    const key = localDateKey(r.created_at);
    const bucket = dayBuckets.get(key);
    if (!bucket) continue;
    bucket.views++;
    bucket.visitors.add(r.visitor_id);
  }
  const daily = [...dayBuckets.entries()].map(([key, b]) => ({
    date: new Date(key).toLocaleDateString("en-IN", { month: "short", day: "numeric" }),
    views: b.views,
    visitors: b.visitors.size,
  }));

  // ─── Totals ─────────────────────────────────────────────────────────────
  const totalViews = rows.length;
  const totalVisitors = new Set(rows.map((r) => r.visitor_id)).size;

  // ─── Top pages ──────────────────────────────────────────────────────────
  const pageCounts = new Map<string, number>();
  for (const r of rows) pageCounts.set(r.path, (pageCounts.get(r.path) ?? 0) + 1);
  const topPages = [...pageCounts.entries()]
    .map(([page, views]) => ({ page, views }))
    .sort((a, b) => b.views - a.views)
    .slice(0, 10);

  // ─── Traffic sources — bucketed per visitor's earliest hit in-period ───
  const firstHitReferrer = new Map<string, string | null>();
  for (const r of rows) {
    if (!firstHitReferrer.has(r.visitor_id)) firstHitReferrer.set(r.visitor_id, r.referrer);
  }
  const sourceCounts = new Map<string, number>();
  for (const referrer of firstHitReferrer.values()) {
    const bucket = bucketReferrer(referrer);
    sourceCounts.set(bucket, (sourceCounts.get(bucket) ?? 0) + 1);
  }
  const visitorTotal = firstHitReferrer.size || 1;
  const trafficSources = [...sourceCounts.entries()]
    .map(([source, count]) => ({
      source,
      pct: Math.round((count / visitorTotal) * 100),
      color: SOURCE_COLORS[source] ?? "bg-gray-400",
    }))
    .sort((a, b) => b.pct - a.pct);

  // ─── Rough session duration: gaps under 30 min = same session; cap a
  // single session at 1 hour so a left-open tab doesn't skew the average.
  const byVisitor = new Map<string, number[]>();
  for (const r of rows) {
    const t = new Date(r.created_at).getTime();
    (byVisitor.get(r.visitor_id) ?? byVisitor.set(r.visitor_id, []).get(r.visitor_id)!).push(t);
  }
  const sessionDurations: number[] = [];
  for (const times of byVisitor.values()) {
    times.sort((a, b) => a - b);
    let sessionStart = times[0];
    let prev = times[0];
    for (let i = 1; i < times.length; i++) {
      const gapMs = times[i] - prev;
      if (gapMs > 30 * 60_000) {
        if (prev !== sessionStart) sessionDurations.push(Math.min(prev - sessionStart, 3600_000));
        sessionStart = times[i];
      }
      prev = times[i];
    }
    if (prev !== sessionStart) sessionDurations.push(Math.min(prev - sessionStart, 3600_000));
  }
  const avgSessionMs = sessionDurations.length
    ? sessionDurations.reduce((s, d) => s + d, 0) / sessionDurations.length
    : null;
  const avgSessionDuration = avgSessionMs === null ? null : (() => {
    const totalSec = Math.round(avgSessionMs / 1000);
    return `${Math.floor(totalSec / 60)}m ${String(totalSec % 60).padStart(2, "0")}s`;
  })();

  return NextResponse.json({ daily, totalViews, totalVisitors, avgSessionDuration, topPages, trafficSources });
}
