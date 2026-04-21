import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const type = req.nextUrl.searchParams.get("type");
  const admin = createAdminClient();

  let query = admin
    .from("wellness_sessions")
    .select("id, business_id, trainer_name, session_type, language, description, price_inr, max_seats, seats_taken, platform, platform_label, start_date, end_date, status, created_at")
    .eq("status", "live")
    .order("start_date", { ascending: true });

  if (type) query = query.eq("session_type", type);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}
