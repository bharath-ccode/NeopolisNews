import { NextRequest, NextResponse } from "next/server";
import { createHmac } from "crypto";

function sign(data: string): string {
  const secret = process.env.OTP_SECRET;
  if (!secret) throw new Error("OTP_SECRET env var is not set.");
  return createHmac("sha256", secret).update(data).digest("hex");
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const { businessId, otp } = body ?? {};

  if (!businessId || !otp) {
    return NextResponse.json({ error: "Missing fields." }, { status: 400 });
  }

  const cookie = req.cookies.get("otp_pending")?.value;
  if (!cookie) {
    return NextResponse.json(
      { error: "Session expired. Please request a new verification code." },
      { status: 400 }
    );
  }

  const parts = cookie.split("|");
  if (parts.length !== 4) {
    return NextResponse.json({ error: "Invalid session. Please request a new code." }, { status: 400 });
  }

  const [cookieBusinessId, cookieOtp, expiresAtStr, storedHmac] = parts;
  const payload = `${cookieBusinessId}|${cookieOtp}|${expiresAtStr}`;

  // Verify signature
  if (sign(payload) !== storedHmac) {
    return NextResponse.json({ error: "Invalid session. Please request a new code." }, { status: 400 });
  }

  // Check businessId
  if (cookieBusinessId !== businessId) {
    return NextResponse.json({ error: "Session mismatch. Please request a new code." }, { status: 400 });
  }

  // Check expiry
  if (Date.now() > Number(expiresAtStr)) {
    return NextResponse.json(
      { error: "Code has expired. Please request a new verification code." },
      { status: 400 }
    );
  }

  // Check OTP
  if (cookieOtp !== otp) {
    return NextResponse.json({ error: "Incorrect code. Please try again." }, { status: 400 });
  }

  // Clear cookie on success
  const res = NextResponse.json({ ok: true });
  res.cookies.set("otp_pending", "", { maxAge: 0, path: "/" });
  return res;
}
