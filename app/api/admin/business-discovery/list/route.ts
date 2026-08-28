import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/** GET ?status=pending|approved|rejected (default pending) &industry=… (optional) */
export async function GET(req: NextRequest) {
  const status = req.nextUrl.searchParams.get("status") ?? "pending";
  const industry = req.nextUrl.searchParams.get("industry");

  const admin = createAdminClient();
  let query = admin
    .from("business_discovery_candidates")
    .select("*")
    .eq("status", status);
  if (industry) query = query.eq("industry", industry);

  const { data, error } = await query
    .order("industry")
    .order("locality")
    .order("business_type")
    .order("name");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}
