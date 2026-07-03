import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/apiAuth";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("article_comments")
    .select("id, author_name, body, created_at")
    .eq("article_id", params.id)
    .eq("status", "active")
    .order("created_at", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireUser(req);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const user_id = auth.user.id;

  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  const { author_name, body: commentBody } =
    body as { author_name?: string; body?: string };

  if (!author_name?.trim()) return NextResponse.json({ error: "author_name required" }, { status: 400 });
  if (!commentBody?.trim())  return NextResponse.json({ error: "body required" },        { status: 400 });
  if (commentBody.trim().length > 2000)
    return NextResponse.json({ error: "Comment is too long (max 2000 characters)." }, { status: 400 });

  const admin = createAdminClient();

  const { data: article } = await admin
    .from("articles")
    .select("id")
    .eq("id", params.id)
    .eq("status", "published")
    .single();
  if (!article) return NextResponse.json({ error: "Article not found" }, { status: 404 });

  const { data, error } = await admin
    .from("article_comments")
    .insert({
      article_id:  params.id,
      author_name: author_name.trim(),
      body:        commentBody.trim(),
      user_id,
    })
    .select("id, author_name, body, created_at")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
