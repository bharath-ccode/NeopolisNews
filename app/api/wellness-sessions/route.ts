import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const type = searchParams.get("type");
  const mode = searchParams.get("mode"); // 'online' | 'on_location'

  const today = new Date().toISOString().split("T")[0];

  const admin = createAdminClient();
  let query = admin
    .from("wellness_sessions")
    .select(`
      id, session_type, trainer_name, language, description,
      price_inr, max_seats, seats_taken,
      meeting_link, platform, platform_label,
      delivery_mode, session_time, address,
      start_date, end_date,
      businesses ( id, name, logo, address, verified )
    `)
    .eq("status", "live")
    .lte("start_date", today)
    .gte("end_date", today)
    .order("session_time", { ascending: true, nullsFirst: false });

  if (type) query = query.eq("session_type", type);
  if (mode) query = query.eq("delivery_mode", mode);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}
