import { NextResponse } from "next/server";
import { runBusinessDiscovery } from "@/lib/businessDiscovery";

export const maxDuration = 300;

/** Manual trigger for admins — same logic the monthly cron runs, for
 *  testing or an on-demand refresh. Protected by middleware (/api/admin/*). */
export async function POST() {
  const summary = await runBusinessDiscovery();
  return NextResponse.json(summary);
}
