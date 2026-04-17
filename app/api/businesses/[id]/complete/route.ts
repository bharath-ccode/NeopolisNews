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
  const { otp, claimToken, contactPhone, description, timings, socialLinks, password } = body ?? {};

  const supabase = createAdminClient();

  // ── Path A: 24-hour claim token (admin-verified flow) ────────────────────
  if (claimToken) {
    const { data: biz, error: bizErr } = await supabase
      .from("businesses")
      .select("id, owner_email, claim_token, claim_token_expires_at")
      .eq("id", id)
      .single();

    if (bizErr || !biz) {
      return NextResponse.json({ error: "Business not found." }, { status: 404 });
    }
    if (!biz.claim_token || biz.claim_token !== claimToken) {
      return NextResponse.json({ error: "Invalid claim link." }, { status: 400 });
    }
    if (!biz.claim_token_expires_at || new Date() > new Date(biz.claim_token_expires_at)) {
      return NextResponse.json(
        { error: "This claim link has expired. Please visit the business profile to request a new one.", code: "token_expired" },
        { status: 400 }
      );
    }

    // Create auth account if password provided
    let ownerId: string | null = null;
    if (password && biz.owner_email) {
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: biz.owner_email,
        password,
        email_confirm: true,
      });

      if (authError) {
        // Already has account — find owner_id from sibling business
        const { data: sibling } = await supabase
          .from("businesses")
          .select("owner_id")
          .eq("owner_email", biz.owner_email)
          .not("owner_id", "is", null)
          .neq("id", id)
          .limit(1)
          .maybeSingle();
        ownerId = sibling?.owner_id ?? null;
      } else {
        ownerId = authData.user?.id ?? null;
      }
    } else if (!password && biz.owner_email) {
      // Returning user — link via sibling
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

    const updateData: Record<string, unknown> = {
      status: "active",
      contact_phone: contactPhone ?? null,
      description: description ?? null,
      timings: timings ?? [],
      social_links: socialLinks ?? {},
      completed_at: new Date().toISOString(),
      // Clear the claim token
      claim_token: null,
      claim_token_expires_at: null,
    };
    if (ownerId) updateData.owner_id = ownerId;

    const { error } = await supabase.from("businesses").update(updateData).eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ ok: true });
  }

  // ── Path B: 10-minute OTP via cookie (self-register / identity-match flow) ─
  if (!otp) {
    return NextResponse.json({ error: "Missing verification code." }, { status: 400 });
  }

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

  // Fetch owner email for account creation
  const { data: biz } = await supabase
    .from("businesses")
    .select("owner_email")
    .eq("id", id)
    .single();

  // Create or link Supabase Auth account
  let ownerId: string | null = null;
  if (biz?.owner_email) {
    if (password) {
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

  const updateData: Record<string, unknown> = {
    status: "active",
    contact_phone: contactPhone ?? null,
    description: description ?? null,
    timings: timings ?? [],
    social_links: socialLinks ?? {},
    completed_at: new Date().toISOString(),
  };
  if (ownerId) updateData.owner_id = ownerId;

  const { error } = await supabase.from("businesses").update(updateData).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const res = NextResponse.json({ ok: true });
  res.cookies.set("otp_pending", "", { maxAge: 0, path: "/" });
  return res;
}
