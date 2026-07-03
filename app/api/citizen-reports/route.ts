import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/** GET ?user_id= — the reporter's own submissions (newest first). */
export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("user_id");
  if (!userId) return NextResponse.json({ error: "user_id required" }, { status: 400 });

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("citizen_reports")
    .select("id, title, body, area, image_url, status, admin_note, article_id, created_at, reviewed_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

/** POST — submit a report for moderation. */
export async function POST(req: NextRequest) {
  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  const { user_id, author_name, title, body: reportBody, area, image_url } = body as {
    user_id?: string; author_name?: string; title?: string;
    body?: string; area?: string; image_url?: string;
  };

  if (!user_id)              return NextResponse.json({ error: "Sign in to submit a report." },   { status: 401 });
  if (!author_name?.trim())  return NextResponse.json({ error: "author_name required" },          { status: 400 });
  if (!title?.trim())        return NextResponse.json({ error: "Please add a headline." },        { status: 400 });
  if (!reportBody?.trim())   return NextResponse.json({ error: "Please describe what happened." },{ status: 400 });
  if (title.trim().length > 150)
    return NextResponse.json({ error: "Headline is too long (max 150 characters)." }, { status: 400 });
  if (reportBody.trim().length > 5000)
    return NextResponse.json({ error: "Report is too long (max 5000 characters)." }, { status: 400 });

  const admin = createAdminClient();

  // At most 3 reports awaiting review per user
  const { count } = await admin
    .from("citizen_reports")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user_id)
    .eq("status", "pending");
  if ((count ?? 0) >= 3)
    return NextResponse.json(
      { error: "You already have 3 reports awaiting review. Please wait for those first." },
      { status: 429 }
    );

  const { data, error } = await admin
    .from("citizen_reports")
    .insert({
      user_id,
      author_name: author_name.trim(),
      title:       title.trim(),
      body:        reportBody.trim(),
      area:        area?.trim() || null,
      image_url:   image_url || null,
    })
    .select("id, title, body, area, image_url, status, admin_note, article_id, created_at, reviewed_at")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
