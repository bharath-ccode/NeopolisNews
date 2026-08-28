import { NextRequest, NextResponse } from "next/server";
import { runBusinessDiscovery } from "@/lib/businessDiscovery";
import type { Locality } from "@/lib/projectsStore";

export const maxDuration = 300;

/** Manual trigger for admins — same logic the monthly cron runs, scoped to
 *  whatever subtypes/locality the admin selected on /admin/business-
 *  discovery. POST { subtypeKeys: string[], localities: string[] } — at
 *  least one subtype and exactly one locality, enforced here too since the
 *  UI restriction alone isn't trustworthy. Manual runs are capped at one
 *  locality at a time while this feature is still settling — search volume
 *  per click stays bounded and easy to review. Protected by middleware
 *  (/api/admin/*). */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const subtypeKeys = Array.isArray(body?.subtypeKeys) ? (body.subtypeKeys as string[]) : [];
  const localities = Array.isArray(body?.localities) ? (body.localities as Locality[]) : [];

  if (subtypeKeys.length === 0) {
    return NextResponse.json({ error: "Select at least one type/subtype to search." }, { status: 400 });
  }
  if (localities.length !== 1) {
    return NextResponse.json({ error: "Select exactly one locality to search (max 1 at a time)." }, { status: 400 });
  }

  const summary = await runBusinessDiscovery({ subtypeKeys: new Set(subtypeKeys), localities });
  return NextResponse.json(summary);
}
