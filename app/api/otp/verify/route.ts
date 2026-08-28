import { NextRequest, NextResponse } from "next/server";
import { verifyOtpCookie, clearOtpCookie } from "@/lib/otp";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const { businessId, otp } = body ?? {};

  if (!businessId || !otp) {
    return NextResponse.json({ error: "Missing fields." }, { status: 400 });
  }

  const result = verifyOtpCookie(req, businessId, otp);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  const res = NextResponse.json({ ok: true });
  clearOtpCookie(res);
  return res;
}
