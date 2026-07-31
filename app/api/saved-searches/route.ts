import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/apiAuth";

export const dynamic = "force-dynamic";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** GET — the token user's active saved searches. */
export async function GET(req: NextRequest) {
  const auth = await requireUser(req);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const userId = auth.user.id;

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("saved_searches")
    .select("id, email, sub_category, listing_type, bedrooms, created_at")
    .eq("user_id", userId)
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

/** POST { email, sub_category?, listing_type?, bedrooms? } — token-verified. */
export async function POST(req: NextRequest) {
  const auth = await requireUser(req);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const user_id = auth.user.id;

  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  const { email, sub_category, listing_type, bedrooms } = body as {
    email?: string;
    sub_category?: string; listing_type?: string; bedrooms?: string;
  };

  const cleanEmail = email?.trim().toLowerCase() ?? "";
  if (!EMAIL_RE.test(cleanEmail))
    return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });

  const admin = createAdminClient();

  const { count } = await admin
    .from("saved_searches")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user_id)
    .eq("is_active", true);
  if ((count ?? 0) >= 5)
    return NextResponse.json({ error: "You can have at most 5 active alerts. Delete one first." }, { status: 429 });

  const { data, error } = await admin
    .from("saved_searches")
    .insert({
      user_id,
      email:        cleanEmail,
      sub_category: sub_category || null,
      listing_type: listing_type || null,
      bedrooms:     bedrooms || null,
    })
    .select("id, email, sub_category, listing_type, bedrooms, created_at")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}

/** DELETE ?id= — deactivate the token user's alert. */
export async function DELETE(req: NextRequest) {
  const auth = await requireUser(req);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const userId = auth.user.id;
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const admin = createAdminClient();
  const { error } = await admin
    .from("saved_searches")
    .update({ is_active: false })
    .eq("id", id)
    .eq("user_id", userId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
