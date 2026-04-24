import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const admin = createAdminClient();
  const today = new Date().toISOString().split("T")[0];

  const { data, error } = await admin
    .from("business_offers")
    .select(`
      id, name, description, discount_percent, discount_label,
      start_date, end_date, image_url, business_id,
      businesses (id, name, logo, industry, verified, address)
    `)
    .eq("status", "active")
    .lte("start_date", today)
    .gte("end_date", today)
    .order("end_date", { ascending: true })
    .limit(60);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}
