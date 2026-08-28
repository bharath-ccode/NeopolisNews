import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const type = req.nextUrl.searchParams.get("type") ?? "";
  const admin = createAdminClient();

  // Show updates from last 60 days
  const since = new Date();
  since.setDate(since.getDate() - 60);

  let query = admin
    .from("business_updates")
    .select(`
      id, type, title, body, image_url, cta_label, cta_url, created_at,
      businesses (id, name, logo, industry, verified, address)
    `)
    .eq("status", "active")
    .gte("created_at", since.toISOString())
    .order("created_at", { ascending: false })
    .limit(80);

  if (type) query = query.eq("type", type);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}
