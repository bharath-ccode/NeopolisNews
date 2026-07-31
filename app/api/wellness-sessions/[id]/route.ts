import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("wellness_sessions")
    .select("id, business_id, trainer_name, session_type, language, description, price_inr, max_seats, seats_taken, platform, platform_label, start_date, end_date, status, created_at")
    .eq("id", params.id)
    .single();

  if (error || !data) return NextResponse.json({ error: "Session not found." }, { status: 404 });
  return NextResponse.json(data);
}
