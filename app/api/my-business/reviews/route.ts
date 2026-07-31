import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { resolveBusinessAuth } from "@/lib/myBusinessAuth";

export const dynamic = "force-dynamic";

/** GET ?businessId= — all reviews for the owner's business. */
export async function GET(req: NextRequest) {
  const businessId = req.nextUrl.searchParams.get("businessId") ?? "";
  const auth = await resolveBusinessAuth(req, businessId);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("business_reviews")
    .select("id, author_name, rating, comment, owner_response, owner_response_at, created_at")
    .eq("business_id", businessId)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

/** PATCH { businessId, reviewId, response } — set or clear the owner's response. */
export async function PATCH(req: NextRequest) {
  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  const { businessId, reviewId, response } =
    body as { businessId?: string; reviewId?: string; response?: string };

  if (!businessId || !reviewId)
    return NextResponse.json({ error: "businessId and reviewId required" }, { status: 400 });

  const auth = await resolveBusinessAuth(req, businessId);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const trimmed = (response ?? "").trim();
  if (trimmed.length > 1000)
    return NextResponse.json({ error: "Response is too long (max 1000 characters)." }, { status: 400 });

  const admin = createAdminClient();

  // Ensure the review belongs to this business
  const { data: review } = await admin
    .from("business_reviews")
    .select("id")
    .eq("id", reviewId)
    .eq("business_id", businessId)
    .single();
  if (!review) return NextResponse.json({ error: "Review not found" }, { status: 404 });

  const { data, error } = await admin
    .from("business_reviews")
    .update({
      owner_response:    trimmed || null,
      owner_response_at: trimmed ? new Date().toISOString() : null,
    })
    .eq("id", reviewId)
    .select("id, author_name, rating, comment, owner_response, owner_response_at, created_at")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
