import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const token = req.headers.get("Authorization")?.replace("Bearer ", "") ?? "";
  if (!token) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const admin = createAdminClient();

  const { data: { user } } = await admin.auth.getUser(token);
  if (!user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const { data, error } = await admin
    .from("session_enrollments")
    .select(`
      id, payment_status, amount_inr, enrolled_at, paid_at,
      wellness_sessions (
        id, trainer_name, session_type, language, description,
        price_inr, platform, platform_label, start_date, end_date, status
      )
    `)
    .eq("user_id", user.id)
    .eq("payment_status", "paid")
    .order("enrolled_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}
