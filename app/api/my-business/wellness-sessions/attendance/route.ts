import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { resolveBusinessAuth } from "@/lib/myBusinessAuth";
import { awardPoints, WELLNESS_ATTENDANCE_POINTS } from "@/lib/points";

export const dynamic = "force-dynamic";

/** GET ?businessId=&sessionId= — paid enrollments for attendance marking. */
export async function GET(req: NextRequest) {
  const businessId = req.nextUrl.searchParams.get("businessId") ?? "";
  const sessionId  = req.nextUrl.searchParams.get("sessionId") ?? "";
  if (!sessionId) return NextResponse.json({ error: "sessionId required" }, { status: 400 });

  const auth = await resolveBusinessAuth(req, businessId);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const admin = createAdminClient();

  const { data: session } = await admin
    .from("wellness_sessions")
    .select("id, business_id")
    .eq("id", sessionId)
    .eq("business_id", businessId)
    .single();
  if (!session) return NextResponse.json({ error: "Session not found" }, { status: 404 });

  const { data, error } = await admin
    .from("session_enrollments")
    .select("user_id, user_email, attended")
    .eq("session_id", sessionId)
    .eq("payment_status", "paid")
    .order("enrolled_at", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

/** POST { businessId, sessionId, attendee_user_ids: string[] } — mark who
 *  attended; each attendee earns points (idempotent, never double-awarded). */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const { businessId, sessionId, attendee_user_ids } = body ?? {};

  if (!sessionId) return NextResponse.json({ error: "sessionId required" }, { status: 400 });
  if (!Array.isArray(attendee_user_ids))
    return NextResponse.json({ error: "attendee_user_ids must be an array" }, { status: 400 });

  const auth = await resolveBusinessAuth(req, businessId ?? "");
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const admin = createAdminClient();

  const { data: session } = await admin
    .from("wellness_sessions")
    .select("id, business_id, session_type, trainer_name")
    .eq("id", sessionId)
    .eq("business_id", businessId)
    .single();
  if (!session) return NextResponse.json({ error: "Session not found" }, { status: 404 });

  // Only paid enrollments can be marked attended
  const { data: enrollments } = await admin
    .from("session_enrollments")
    .select("user_id")
    .eq("session_id", sessionId)
    .eq("payment_status", "paid");
  const paid = new Set((enrollments ?? []).map((e) => e.user_id));
  const attendees = (attendee_user_ids as string[]).filter((id) => paid.has(id));

  const now = new Date().toISOString();

  const { error: resetErr } = await admin
    .from("session_enrollments")
    .update({ attended: false, attended_at: null })
    .eq("session_id", sessionId);
  if (resetErr) return NextResponse.json({ error: resetErr.message }, { status: 500 });

  if (attendees.length) {
    const { error: setErr } = await admin
      .from("session_enrollments")
      .update({ attended: true, attended_at: now })
      .eq("session_id", sessionId)
      .in("user_id", attendees);
    if (setErr) return NextResponse.json({ error: setErr.message }, { status: 500 });
  }

  for (const attendeeId of attendees) {
    await awardPoints(admin, {
      userId:      attendeeId,
      points:      WELLNESS_ATTENDANCE_POINTS,
      sourceType:  "wellness_session_attendance",
      sourceId:    session.id,
      description: `Attended: ${session.session_type} with ${session.trainer_name}`,
    });
  }

  return NextResponse.json({
    ok: true,
    attended: attendees.length,
    points_each: WELLNESS_ATTENDANCE_POINTS,
  });
}
