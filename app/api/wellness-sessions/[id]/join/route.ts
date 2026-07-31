import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const token = req.headers.get("Authorization")?.replace("Bearer ", "") ?? "";
  if (!token) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const admin = createAdminClient();

  const { data: { user } } = await admin.auth.getUser(token);
  if (!user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  // Verify paid enrollment
  const { data: enrollment } = await admin
    .from("session_enrollments")
    .select("payment_status")
    .eq("session_id", params.id)
    .eq("user_id", user.id)
    .single();

  if (!enrollment || enrollment.payment_status !== "paid")
    return NextResponse.json({ error: "No active enrollment for this session." }, { status: 403 });

  // Return meeting link
  const { data: session } = await admin
    .from("wellness_sessions")
    .select("meeting_link, platform, platform_label")
    .eq("id", params.id)
    .single();

  if (!session?.meeting_link)
    return NextResponse.json({ error: "Meeting link not available yet." }, { status: 404 });

  return NextResponse.json({
    meeting_link: session.meeting_link,
    platform: session.platform,
    platform_label: session.platform_label,
  });
}
