import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const admin = createAdminClient();
  const { data } = await admin
    .from("business_reviews")
    .select("id, author_name, rating, comment, created_at")
    .eq("business_id", params.id)
    .order("created_at", { ascending: false });
  return NextResponse.json(data ?? []);
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await req.json().catch(() => null);
  const { author_name, rating, comment } = body ?? {};

  if (!author_name?.trim())
    return NextResponse.json({ error: "Name is required." }, { status: 400 });
  if (!rating || rating < 1 || rating > 5)
    return NextResponse.json({ error: "Rating must be between 1 and 5." }, { status: 400 });

  const admin = createAdminClient();

  const { data: biz } = await admin
    .from("businesses")
    .select("id")
    .eq("id", params.id)
    .single();
  if (!biz) return NextResponse.json({ error: "Business not found." }, { status: 404 });

  const { data, error } = await admin
    .from("business_reviews")
    .insert({
      business_id: params.id,
      author_name: author_name.trim(),
      rating,
      comment: comment?.trim() || null,
    })
    .select("id, author_name, rating, comment, created_at")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
