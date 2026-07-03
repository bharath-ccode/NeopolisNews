import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** GET ?user_id= — my active saved searches. */
export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("user_id");
  if (!userId) return NextResponse.json({ error: "user_id required" }, { status: 400 });

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

/** POST { user_id, email, sub_category?, listing_type?, bedrooms? } */
export async function POST(req: NextRequest) {
  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  const { user_id, email, sub_category, listing_type, bedrooms } = body as {
    user_id?: string; email?: string;
    sub_category?: string; listing_type?: string; bedrooms?: string;
  };

  if (!user_id) return NextResponse.json({ error: "Sign in to save a search." }, { status: 401 });
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

/** DELETE ?id=&user_id= — deactivate an alert. */
export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  const userId = req.nextUrl.searchParams.get("user_id");
  if (!id || !userId) return NextResponse.json({ error: "id and user_id required" }, { status: 400 });

  const admin = createAdminClient();
  const { error } = await admin
    .from("saved_searches")
    .update({ is_active: false })
    .eq("id", id)
    .eq("user_id", userId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
