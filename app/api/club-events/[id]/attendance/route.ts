import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { isClubLead } from "@/lib/clubs";
import { awardPoints } from "@/lib/points";
import { requireUser } from "@/lib/apiAuth";

export const dynamic = "force-dynamic";

/** GET — lead views the registration list for attendance marking. */
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireUser(req);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const userId = auth.user.id;

  const admin = createAdminClient();

  const { data: event } = await admin
    .from("club_events")
    .select("id, club_id")
    .eq("id", params.id)
    .single();
  if (!event) return NextResponse.json({ error: "Event not found" }, { status: 404 });

  if (!(await isClubLead(admin, event.club_id, userId)))
    return NextResponse.json({ error: "Only the club lead can view registrations." }, { status: 403 });

  const { data, error } = await admin
    .from("club_event_registrations")
    .select("id, user_id, participant_name, is_member, amount_inr, payment_status, attended, created_at")
    .eq("event_id", params.id)
    .order("created_at", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

/** POST { attendee_user_ids: string[] } — lead (verified by token) marks who
 *  showed up. Marks the event completed and awards each attendee the event's
 *  points (idempotent — re-marking never double-awards). */
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireUser(req);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const user_id = auth.user.id;

  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  const { attendee_user_ids } = body as { attendee_user_ids?: string[] };

  if (!Array.isArray(attendee_user_ids))
    return NextResponse.json({ error: "attendee_user_ids must be an array" }, { status: 400 });

  const admin = createAdminClient();

  const { data: event } = await admin
    .from("club_events")
    .select("id, club_id, title, points_award, status")
    .eq("id", params.id)
    .single();
  if (!event) return NextResponse.json({ error: "Event not found" }, { status: 404 });
  if (event.status === "cancelled")
    return NextResponse.json({ error: "Event was cancelled." }, { status: 400 });

  if (!(await isClubLead(admin, event.club_id, user_id)))
    return NextResponse.json({ error: "Only the club lead can mark attendance." }, { status: 403 });

  // Only registered users can be marked as attended
  const { data: regs } = await admin
    .from("club_event_registrations")
    .select("user_id")
    .eq("event_id", params.id);
  const registered = new Set((regs ?? []).map((r) => r.user_id));
  const attendees = attendee_user_ids.filter((id) => registered.has(id));

  const now = new Date().toISOString();

  // Reset then set — the lead's checkbox list is the source of truth
  const { error: resetErr } = await admin
    .from("club_event_registrations")
    .update({ attended: false, attended_at: null })
    .eq("event_id", params.id);
  if (resetErr) return NextResponse.json({ error: resetErr.message }, { status: 500 });

  if (attendees.length) {
    const { error: setErr } = await admin
      .from("club_event_registrations")
      .update({ attended: true, attended_at: now })
      .eq("event_id", params.id)
      .in("user_id", attendees);
    if (setErr) return NextResponse.json({ error: setErr.message }, { status: 500 });
  }

  await admin.from("club_events").update({ status: "completed" }).eq("id", params.id);

  // Award points — idempotent per (user, source), so re-marking is safe
  let awarded = 0;
  for (const attendeeId of attendees) {
    const res = await awardPoints(admin, {
      userId:      attendeeId,
      points:      event.points_award,
      sourceType:  "club_event_attendance",
      sourceId:    event.id,
      description: `Attended: ${event.title}`,
    });
    if (res.awarded) awarded++;
  }

  return NextResponse.json({
    ok: true,
    attended: attendees.length,
    points_each: event.points_award,
  });
}
