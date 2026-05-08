import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "10", 10), 50);
  const from  = searchParams.get("from") ?? new Date().toISOString().slice(0, 10);

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("business_events")
    .select("id, name, event_type, event_date, end_date, start_time, image_url, is_free, businesses(name)")
    .gte("event_date", from)
    .order("event_date", { ascending: true })
    .limit(limit);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}
