import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { createHmac } from "crypto";

const KEY_SECRET = process.env.RAZORPAY_KEY_SECRET ?? "";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const token = req.headers.get("Authorization")?.replace("Bearer ", "") ?? "";
  if (!token) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const body = await req.json().catch(() => null);
  const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = body ?? {};

  if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature)
    return NextResponse.json({ error: "razorpay_payment_id, razorpay_order_id, razorpay_signature are required." }, { status: 400 });

  const admin = createAdminClient();

  const { data: { user } } = await admin.auth.getUser(token);
  if (!user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  // Verify Razorpay signature
  const expected = createHmac("sha256", KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  if (expected !== razorpay_signature)
    return NextResponse.json({ error: "Payment verification failed." }, { status: 400 });

  // Mark enrollment as paid
  const { error: enrollErr } = await admin
    .from("session_enrollments")
    .update({
      payment_status: "paid",
      razorpay_payment_id,
      paid_at: new Date().toISOString(),
    })
    .eq("session_id", params.id)
    .eq("user_id", user.id)
    .eq("razorpay_order_id", razorpay_order_id);

  if (enrollErr) return NextResponse.json({ error: enrollErr.message }, { status: 500 });

  // Increment seats_taken
  const { data: cur } = await admin
    .from("wellness_sessions")
    .select("seats_taken")
    .eq("id", params.id)
    .single();
  if (cur) {
    await admin
      .from("wellness_sessions")
      .update({ seats_taken: cur.seats_taken + 1 })
      .eq("id", params.id);
  }

  return NextResponse.json({ ok: true });
}
