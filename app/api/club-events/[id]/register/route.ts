import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { createOrder } from "@/lib/razorpay";

export const dynamic = "force-dynamic";

/** POST { participant_name } — register for a club event.
 *  Members pay the member fee (usually waived); non-members pay the full fee.
 *  Free → registered instantly. Paid → returns a Razorpay order to complete. */
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const token = req.headers.get("Authorization")?.replace("Bearer ", "") ?? "";
  if (!token) return NextResponse.json({ error: "Sign in to register." }, { status: 401 });

  const admin = createAdminClient();
  const { data: { user } } = await admin.auth.getUser(token);
  if (!user) return NextResponse.json({ error: "Invalid or expired session." }, { status: 401 });

  let body: { participant_name?: string } = {};
  try { body = await req.json(); } catch { /* body optional */ }
  const participantName = body.participant_name?.trim();
  if (!participantName)
    return NextResponse.json({ error: "participant_name required" }, { status: 400 });

  const { data: event } = await admin
    .from("club_events")
    .select("id, club_id, title, event_date, fee_inr, member_fee_inr, max_participants, status")
    .eq("id", params.id)
    .single();
  if (!event) return NextResponse.json({ error: "Event not found" }, { status: 404 });
  if (event.status !== "upcoming")
    return NextResponse.json({ error: "Registration is closed for this event." }, { status: 400 });

  // Capacity check
  if (event.max_participants) {
    const { count } = await admin
      .from("club_event_registrations")
      .select("id", { count: "exact", head: true })
      .eq("event_id", params.id);
    if ((count ?? 0) >= event.max_participants)
      return NextResponse.json({ error: "This event is full." }, { status: 400 });
  }

  // Already registered?
  const { data: existing } = await admin
    .from("club_event_registrations")
    .select("id, payment_status")
    .eq("event_id", params.id)
    .eq("user_id", user.id)
    .maybeSingle();
  if (existing && existing.payment_status !== "pending")
    return NextResponse.json({ error: "You're already registered for this event." }, { status: 400 });

  // Membership determines the fee
  const { data: membership } = await admin
    .from("club_members")
    .select("id")
    .eq("club_id", event.club_id)
    .eq("user_id", user.id)
    .maybeSingle();
  const isMember = Boolean(membership);
  const fee = isMember ? event.member_fee_inr : event.fee_inr;

  // Free (or waived) → registered immediately
  if (fee <= 0) {
    const { error } = await admin.from("club_event_registrations").upsert(
      {
        event_id:         params.id,
        club_id:          event.club_id,
        user_id:          user.id,
        participant_name: participantName,
        is_member:        isMember,
        amount_inr:       0,
        payment_status:   "free",
      },
      { onConflict: "event_id,user_id" }
    );
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ registered: true, paid: false, waived: isMember && event.fee_inr > 0 });
  }

  // Paid → create a Razorpay order (same flow as wellness sessions)
  const result = await createOrder(
    fee,
    `ce_${params.id.slice(0, 8)}_${user.id.slice(0, 8)}`
  );
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.status });

  const { error } = await admin.from("club_event_registrations").upsert(
    {
      event_id:          params.id,
      club_id:           event.club_id,
      user_id:           user.id,
      participant_name:  participantName,
      is_member:         isMember,
      amount_inr:        fee,
      payment_status:    "pending",
      razorpay_order_id: result.order.id,
    },
    { onConflict: "event_id,user_id" }
  );
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({
    registered: false,
    orderId:    result.order.id,
    amount:     fee,
    keyId:      result.keyId,
    eventTitle: event.title,
  });
}
