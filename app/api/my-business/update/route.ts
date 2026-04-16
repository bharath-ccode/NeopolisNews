import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization") ?? "";
  const token = authHeader.replace("Bearer ", "").trim();

  if (!token) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const supabase = createAdminClient();

  // Verify the JWT and get the user
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) {
    return NextResponse.json({ error: "Invalid or expired session." }, { status: 401 });
  }

  // Find their business by owner_email or owner_id
  const { data: biz, error: bizError } = await supabase
    .from("businesses")
    .select("id, owner_email, owner_id")
    .or(`owner_email.eq.${user.email},owner_id.eq.${user.id}`)
    .single();

  if (bizError || !biz) {
    return NextResponse.json({ error: "No business found for your account." }, { status: 404 });
  }

  const body = await req.json().catch(() => null);
  const { contactPhone, description, timings, socialLinks } = body ?? {};

  const { error: updateError } = await supabase
    .from("businesses")
    .update({
      contact_phone: contactPhone ?? null,
      description: description ?? null,
      timings: timings ?? [],
      social_links: socialLinks ?? {},
    })
    .eq("id", biz.id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
