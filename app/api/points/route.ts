import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/apiAuth";
import { computeStats } from "@/lib/points";

export const dynamic = "force-dynamic";

/** GET → { balance, entries, stats } for the token's user. */
export async function GET(req: NextRequest) {
  const auth = await requireUser(req);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const userId = auth.user.id;

  const admin = createAdminClient();
  const [historyRes, allRes] = await Promise.all([
    admin
      .from("user_points_ledger")
      .select("id, points, kind, source_type, description, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(100),
    admin
      .from("user_points_ledger")
      .select("points, kind, source_type, created_at")
      .eq("user_id", userId),
  ]);

  if (historyRes.error) return NextResponse.json({ error: historyRes.error.message }, { status: 500 });

  const all = allRes.data ?? [];
  const balance = all.reduce((sum, e) => sum + e.points, 0);
  return NextResponse.json({
    balance,
    entries: historyRes.data ?? [],
    stats: computeStats(all),
  });
}
