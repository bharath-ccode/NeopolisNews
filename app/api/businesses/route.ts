import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const industry = req.nextUrl.searchParams.get("industry");
  const limit    = Math.min(parseInt(req.nextUrl.searchParams.get("limit") ?? "40"), 100);

  const admin = createAdminClient();

  let query = admin
    .from("businesses")
    .select("id, name, industry, address, logo, verified")
    .eq("status", "active")
    .order("name", { ascending: true })
    .limit(limit);

  if (industry) query = query.eq("industry", industry);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}
