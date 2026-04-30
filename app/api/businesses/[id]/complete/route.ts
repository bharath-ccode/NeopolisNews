import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { verifyOtpCookie, clearOtpCookie } from "@/lib/otp";

// Look up an existing auth.users record by email via the GoTrue Admin REST API.
// The Supabase JS admin SDK has no email-filter on listUsers(), so we call the
// endpoint directly with the service-role key.
async function findAuthUserIdByEmail(email: string): Promise<string | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  try {
    const res = await fetch(
      `${url}/auth/v1/admin/users?filter=${encodeURIComponent(email)}&per_page=1`,
      { headers: { apikey: key, Authorization: `Bearer ${key}` } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    const users: Array<{ email: string; id: string }> = data?.users ?? [];
    return users.find((u) => u.email === email)?.id ?? null;
  } catch {
    return null;
  }
}

// Get or create a Supabase Auth user for the given email.
// - If password is provided: create with email+password.
// - If the email already exists (individual account or prior business claim):
//   look up their existing ID rather than failing.
// - If no password: find existing account only (returning owner).
async function resolveOwnerId(
  supabase: ReturnType<typeof createAdminClient>,
  email: string,
  password?: string
): Promise<string | null> {
  if (password) {
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });
    if (!error) return data.user?.id ?? null;
    // Email already exists — link to it.
    return findAuthUserIdByEmail(email);
  }

  // No password: returning owner who already has an account.
  // First try sibling businesses (faster), then fall back to email lookup.
  const { data: sibling } = await supabase
    .from("businesses")
    .select("owner_id")
    .eq("owner_email", email)
    .not("owner_id", "is", null)
    .limit(1)
    .maybeSingle();
  if (sibling?.owner_id) return sibling.owner_id;

  return findAuthUserIdByEmail(email);
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

    const ownerId = biz.owner_email
      ? await resolveOwnerId(supabase, biz.owner_email, password || undefined)
      : null;

    const updateData: Record<string, unknown> = {
      status: "active",
      contact_phone: contactPhone ?? null,
      description: description ?? null,
      timings: timings ?? [],
      social_links: socialLinks ?? {},
      completed_at: new Date().toISOString(),
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

  const verification = verifyOtpCookie(req, id, otp);
  if (!verification.ok) {
    return NextResponse.json({ error: verification.error }, { status: verification.status });
  }

  const { data: biz } = await supabase
    .from("businesses")
    .select("owner_email")
    .eq("id", id)
    .single();

  const ownerId = biz?.owner_email
    ? await resolveOwnerId(supabase, biz.owner_email, password || undefined)
    : null;

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
  clearOtpCookie(res);
  return res;
}
