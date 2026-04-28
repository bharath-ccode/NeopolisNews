import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  const { author_name, body: replyBody, user_id } =
    body as { author_name?: string; body?: string; user_id?: string };

  if (!author_name?.trim()) return NextResponse.json({ error: "author_name required" }, { status: 400 });
  if (!replyBody?.trim())   return NextResponse.json({ error: "body required" },         { status: 400 });

  const admin = createAdminClient();

  // Verify post exists and is active
  const { data: post, error: postErr } = await admin
    .from("forum_posts").select("id, status").eq("id", params.id).single();
  if (postErr || !post) return NextResponse.json({ error: "Post not found" }, { status: 404 });
  if (post.status === "closed") return NextResponse.json({ error: "Thread is closed" }, { status: 403 });

  const { data: reply, error } = await admin
    .from("forum_replies")
    .insert({ post_id: params.id, author_name: author_name.trim(), body: replyBody.trim(), user_id: user_id ?? null })
    .select("id, author_name, body, created_at")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Update reply_count to exact count
  const { count } = await admin.from("forum_replies").select("id", { count: "exact", head: true }).eq("post_id", params.id);
  await admin.from("forum_posts").update({ reply_count: count ?? 0 }).eq("id", params.id);

  return NextResponse.json(reply, { status: 201 });
}
