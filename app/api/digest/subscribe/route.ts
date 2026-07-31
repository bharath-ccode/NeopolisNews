import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/rateLimit";
import { createAdminClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const limited = rateLimit(req, "digest-sub", { limit: 5 });
  if (limited) return limited;

  const body = await req.json().catch(() => null);
  const { email, name } = body ?? {};

  if (!email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
    return NextResponse.json({ error: "A valid email is required." }, { status: 400 });

  const admin = createAdminClient();

  const { error } = await admin
    .from("digest_subscribers")
    .upsert(
      { email: email.trim().toLowerCase(), name: name?.trim() || null, is_active: true },
      { onConflict: "email" }
    );

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
