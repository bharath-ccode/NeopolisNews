import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { isClubLead } from "@/lib/clubs";
import { DEFAULT_EVENT_POINTS } from "@/lib/points";
import { requireUser } from "@/lib/apiAuth";

export const dynamic = "force-dynamic";

/** POST — lead (token-verified) creates a club event. */
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireUser(req);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const user_id = auth.user.id;

  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  const {
    title, description, venue, event_date, start_time,
    fee_inr, member_fee_inr, max_participants, points_award,
  } = body as {
    title?: string; description?: string; venue?: string;
    event_date?: string; start_time?: string; fee_inr?: number;
    member_fee_inr?: number; max_participants?: number; points_award?: number;
  };

  if (!title?.trim())  return NextResponse.json({ error: "Please add an event title." }, { status: 400 });
  if (!event_date)     return NextResponse.json({ error: "Please pick a date." }, { status: 400 });

  const date = new Date(event_date);
  if (isNaN(date.getTime()))
    return NextResponse.json({ error: "Invalid date." }, { status: 400 });

  const fee       = Math.max(0, Math.round(fee_inr ?? 0));
  const memberFee = Math.max(0, Math.round(member_fee_inr ?? 0));
  if (memberFee > fee)
    return NextResponse.json({ error: "Member fee can't be higher than the regular fee." }, { status: 400 });

  const admin = createAdminClient();

  const { data: club } = await admin
    .from("clubs")
    .select("id, status, category")
    .eq("id", params.id)
    .single();
  if (!club || club.status !== "active")
    return NextResponse.json({ error: "Club not found" }, { status: 404 });

  if (!(await isClubLead(admin, params.id, user_id)))
    return NextResponse.json({ error: "Only the club lead can create events." }, { status: 403 });

  const points =
    points_award !== undefined
      ? Math.min(500, Math.max(0, Math.round(points_award)))
      : DEFAULT_EVENT_POINTS[club.category] ?? 20;

  const { data, error } = await admin
    .from("club_events")
    .insert({
      club_id:          params.id,
      title:            title.trim(),
      description:      description?.trim() || null,
      venue:            venue?.trim() || null,
      event_date,
      start_time:       start_time?.trim() || null,
      fee_inr:          fee,
      member_fee_inr:   memberFee,
      max_participants: max_participants ? Math.max(1, Math.round(max_participants)) : null,
      points_award:     points,
    })
    .select("id")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ id: data.id }, { status: 201 });
}
