import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { createOrder } from "@/lib/razorpay";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const token = req.headers.get("Authorization")?.replace("Bearer ", "") ?? "";
  if (!token) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const admin = createAdminClient();

  const { data: { user } } = await admin.auth.getUser(token);
  if (!user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  // Load session
  const { data: session } = await admin
    .from("wellness_sessions")
    .select("id, price_inr, max_seats, seats_taken, status, start_date, end_date")
    .eq("id", params.id)
    .single();

  if (!session) return NextResponse.json({ error: "Session not found." }, { status: 404 });
  if (session.status !== "live") return NextResponse.json({ error: "Session is not open for enrollment." }, { status: 400 });
  if (session.seats_taken >= session.max_seats) return NextResponse.json({ error: "Session is full." }, { status: 400 });

  // Check if already enrolled
  const { data: existing } = await admin
    .from("session_enrollments")
    .select("id, payment_status")
    .eq("session_id", params.id)
    .eq("user_id", user.id)
    .single();

  if (existing?.payment_status === "paid")
    return NextResponse.json({ error: "You are already enrolled in this session." }, { status: 400 });

  // Create Razorpay order
  const result = await createOrder(
    session.price_inr,
    `ws_${params.id.slice(0, 8)}_${user.id.slice(0, 8)}`
  );
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.status });

  // Upsert enrollment as pending
  await admin.from("session_enrollments").upsert(
    {
      session_id: params.id,
      user_id: user.id,
      razorpay_order_id: result.order.id,
      payment_status: "pending",
      amount_inr: session.price_inr,
    },
    { onConflict: "session_id,user_id" }
  );

  return NextResponse.json({
    orderId: result.order.id,
    amount: session.price_inr,
    keyId: result.keyId,
    sessionId: params.id,
  });
}
