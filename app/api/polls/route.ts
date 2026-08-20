import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { optionalUser } from "@/lib/apiAuth";
import { getPollWithResults } from "@/lib/pollResults";

export const dynamic = "force-dynamic";

/** GET — latest published poll (with live results) plus a lightweight
 *  archive list of past published polls (question + date only; fetch
 *  /api/polls/[id] for a given archive entry's full results). */
export async function GET(req: NextRequest) {
  const today = new Date().toISOString().split("T")[0];
  const admin = createAdminClient();
  const user = await optionalUser(req);

  const [{ data: latestPoll }, { data: archivePolls }] = await Promise.all([
    admin
      .from("polls")
      .select("id, question, publish_date")
      .eq("status", "published")
      .lte("publish_date", today)
      .order("publish_date", { ascending: false })
      .limit(1)
      .maybeSingle(),
    admin
      .from("polls")
      .select("id, question, publish_date")
      .eq("status", "published")
      .lte("publish_date", today)
      .order("publish_date", { ascending: false })
      .range(0, 49),
  ]);

  const latest = latestPoll ? await getPollWithResults(admin, latestPoll, user?.id) : null;

  return NextResponse.json({
    latest,
    archive: archivePolls ?? [],
  });
}
