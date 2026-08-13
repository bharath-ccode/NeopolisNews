import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/** GET ?status=pending|approved|rejected (default pending) */
export async function GET(req: NextRequest) {
  const status = req.nextUrl.searchParams.get("status") ?? "pending";
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("health_business_candidates")
    .select("*")
    .eq("status", status)
    .order("locality")
    .order("business_type")
    .order("name");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}
