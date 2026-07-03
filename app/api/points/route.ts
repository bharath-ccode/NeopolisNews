import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/** GET ?user_id= → { balance, entries } */
export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("user_id");
  if (!userId) return NextResponse.json({ error: "user_id required" }, { status: 400 });

  const admin = createAdminClient();
  const [historyRes, allRes] = await Promise.all([
    admin
      .from("user_points_ledger")
      .select("id, points, kind, source_type, description, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(100),
    admin.from("user_points_ledger").select("points").eq("user_id", userId),
  ]);

  if (historyRes.error) return NextResponse.json({ error: historyRes.error.message }, { status: 500 });

  const balance = (allRes.data ?? []).reduce((sum, e) => sum + e.points, 0);
  return NextResponse.json({ balance, entries: historyRes.data ?? [] });
}
