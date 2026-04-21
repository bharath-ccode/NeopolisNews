import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { resolveBusinessAuth } from "@/lib/myBusinessAuth";

export async function GET(req: NextRequest) {
  const businessId = req.nextUrl.searchParams.get("businessId");
  if (!businessId) return NextResponse.json({ error: "businessId required." }, { status: 400 });

  const auth = await resolveBusinessAuth(req, businessId);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("business_news_submissions")
    .select("*")
    .eq("business_id", businessId)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const { businessId, headline, what_happened, where_location, go_live_date, image_url } = body ?? {};

  if (!businessId || !headline || !what_happened || !where_location || !go_live_date) {
    return NextResponse.json(
      { error: "businessId, headline, what_happened, where_location, go_live_date are required." },
      { status: 400 }
    );
  }

  const auth = await resolveBusinessAuth(req, businessId);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const admin = createAdminClient();

  // Auto-create a draft article for admin review
  const excerpt = what_happened.slice(0, 200) + (what_happened.length > 200 ? "…" : "");
  const content = `${what_happened}\n\n**Location:** ${where_location}`;
  const wordCount = what_happened.split(/\s+/).length;
  const readMinutes = Math.max(1, Math.round(wordCount / 200));

  const { data: article, error: articleError } = await admin
    .from("articles")
    .insert({
      title: headline,
      excerpt,
      content,
      category: "community",
      tag: "Community",
      tag_color: "tag-purple",
      author: auth.data.businessName,
      date: go_live_date,
      read_time: `${readMinutes} min read`,
      views: 0,
      sponsored: false,
      status: "draft",
      image_url: image_url ?? null,
      source: "business",
    })
    .select("id")
    .single();

  if (articleError) return NextResponse.json({ error: articleError.message }, { status: 500 });

  // Save the submission linked to the draft article
  const { data: submission, error: subError } = await admin
    .from("business_news_submissions")
    .insert({
      business_id: businessId,
      headline,
      what_happened,
      where_location,
      go_live_date,
      image_url: image_url ?? null,
      submission_status: "pending",
      article_id: article.id,
    })
    .select()
    .single();

  if (subError) return NextResponse.json({ error: subError.message }, { status: 500 });
  return NextResponse.json(submission);
}
