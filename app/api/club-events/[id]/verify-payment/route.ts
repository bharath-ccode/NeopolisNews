import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { verifySignature } from "@/lib/razorpay";

export const dynamic = "force-dynamic";

/** POST { razorpay_payment_id, razorpay_order_id, razorpay_signature } */
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const token = req.headers.get("Authorization")?.replace("Bearer ", "") ?? "";
  if (!token) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const admin = createAdminClient();
  const { data: { user } } = await admin.auth.getUser(token);
  if (!user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const body = await req.json().catch(() => null);
  const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = body ?? {};
  if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature)
    return NextResponse.json(
      { error: "razorpay_payment_id, razorpay_order_id, razorpay_signature are required." },
      { status: 400 }
    );

  if (!verifySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature))
    return NextResponse.json({ error: "Payment verification failed." }, { status: 400 });

  const { data, error } = await admin
    .from("club_event_registrations")
    .update({ payment_status: "paid", razorpay_payment_id })
    .eq("event_id", params.id)
    .eq("user_id", user.id)
    .eq("razorpay_order_id", razorpay_order_id)
    .select("id")
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: "Registration not found." }, { status: 404 });
  return NextResponse.json({ ok: true });
}
