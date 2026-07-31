import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const { email } = body ?? {};

  if (!email?.trim())
    return NextResponse.json({ error: "Email is required." }, { status: 400 });

  const admin = createAdminClient();
  const { error } = await admin
    .from("digest_subscribers")
    .update({ is_active: false })
    .eq("email", email.trim().toLowerCase());

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
