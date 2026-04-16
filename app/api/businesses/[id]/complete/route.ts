import { NextRequest, NextResponse } from "next/server";
import { createHmac } from "crypto";
import { createAdminClient } from "@/lib/supabase/server";

function sign(data: string): string {
  const secret = process.env.OTP_SECRET;
  if (!secret) throw new Error("OTP_SECRET env var is not set.");
  return createHmac("sha256", secret).update(data).digest("hex");
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const body = await req.json().catch(() => null);
  const { otp, contactPhone, description, timings, socialLinks, password } = body ?? {};

  if (!otp) {
    return NextResponse.json({ error: "Missing verification code." }, { status: 400 });
  }

  // Verify OTP cookie
  const cookie = req.cookies.get("otp_pending")?.value;
  if (!cookie) {
    return NextResponse.json(
      { error: "Session expired. Please request a new code." },
      { status: 400 }
    );
  }

  const parts = cookie.split("|");
  if (parts.length !== 4) {
    return NextResponse.json({ error: "Invalid session." }, { status: 400 });
  }

  const [cookieId, cookieOtp, expiresAtStr, storedHmac] = parts;
  const payload = `${cookieId}|${cookieOtp}|${expiresAtStr}`;

  if (sign(payload) !== storedHmac) {
    return NextResponse.json({ error: "Invalid session." }, { status: 400 });
  }
  if (cookieId !== id) {
    return NextResponse.json({ error: "Session mismatch." }, { status: 400 });
  }
  if (Date.now() > Number(expiresAtStr)) {
    return NextResponse.json({ error: "Code has expired. Please request a new one." }, { status: 400 });
  }
  if (cookieOtp !== String(otp)) {
    return NextResponse.json({ error: "Incorrect code. Please try again." }, { status: 400 });
  }

  const supabase = createAdminClient();

  // Fetch owner email for account creation
  const { data: biz } = await supabase
    .from("businesses")
    .select("owner_email")
    .eq("id", id)
    .single();

  // Create or link a Supabase Auth account
  let ownerId: string | null = null;
  if (biz?.owner_email) {
    if (password) {
      // New user — create account (OTP already verified ownership)
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: biz.owner_email,
        password,
        email_confirm: true,
      });

      if (authError) {
        return NextResponse.json({ error: "Failed to create account. Please try again." }, { status: 500 });
      }
      ownerId = authData.user?.id ?? null;
    } else {
      // Existing user — find their owner_id from another business they already claimed
      const { data: sibling } = await supabase
        .from("businesses")
        .select("owner_id")
        .eq("owner_email", biz.owner_email)
        .not("owner_id", "is", null)
        .neq("id", id)
        .limit(1)
        .maybeSingle();

      ownerId = sibling?.owner_id ?? null;
    }
  }

  // Update business record
  const updateData: Record<string, unknown> = {
    status: "active",
    contact_phone: contactPhone ?? null,
    description: description ?? null,
    timings: timings ?? [],
    social_links: socialLinks ?? {},
    completed_at: new Date().toISOString(),
  };
  if (ownerId) updateData.owner_id = ownerId;

  const { error } = await supabase
    .from("businesses")
    .update(updateData)
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set("otp_pending", "", { maxAge: 0, path: "/" });
  return res;
}
