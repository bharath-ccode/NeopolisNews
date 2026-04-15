import { NextRequest, NextResponse } from "next/server";
import { verifyOtp } from "@/lib/otpStore";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const { businessId, otp } = body ?? {};

  if (!businessId || !otp) {
    return NextResponse.json({ error: "Missing fields." }, { status: 400 });
  }

  const valid = verifyOtp(businessId, otp);
  if (!valid) {
    return NextResponse.json({ error: "Invalid or expired code. Please request a new OTP." }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
