import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization") ?? "";
  const token = authHeader.replace("Bearer ", "").trim();
  if (!token) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const supabase = createAdminClient();

  const { data: { user }, error: authErr } = await supabase.auth.getUser(token);
  if (authErr || !user) return NextResponse.json({ error: "Invalid session." }, { status: 401 });

  const body = await req.json().catch(() => null);
  const { businessId, type, url, action, index } = body ?? {};

  if (!businessId || !type || !action) {
    return NextResponse.json({ error: "businessId, type, and action are required." }, { status: 400 });
  }

  // Verify ownership
  const { data: biz } = await supabase
    .from("businesses")
    .select("id, owner_email, owner_id, logo, pictures")
    .eq("id", businessId)
    .or(`owner_email.eq.${user.email},owner_id.eq.${user.id}`)
    .single();

  if (!biz) return NextResponse.json({ error: "Business not found or access denied." }, { status: 404 });

  let update: Record<string, unknown> = {};

  if (type === "logo") {
    update.logo = action === "remove" ? null : (url ?? null);
  } else if (type === "photo") {
    const current: string[] = biz.pictures ?? [];
    if (action === "add") {
      if (current.length >= 3) return NextResponse.json({ error: "Maximum 3 photos allowed." }, { status: 400 });
      update.pictures = [...current, url];
    } else if (action === "remove") {
      update.pictures = current.filter((_, i) => i !== index);
    }
  } else {
    return NextResponse.json({ error: "Invalid type." }, { status: 400 });
  }

  const { error } = await supabase.from("businesses").update(update).eq("id", biz.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true, pictures: update.pictures });
}
