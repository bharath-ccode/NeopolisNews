import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const industry = searchParams.get("industry");
  const type     = searchParams.get("type");
  const q        = searchParams.get("q");
  const page     = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
  const limit    = 20;
  const offset   = (page - 1) * limit;

  const admin = createAdminClient();
  let query = admin
    .from("forum_posts")
    .select("id, author_name, title, body, industry, type, reply_count, has_poll, created_at")
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (industry) query = query.eq("industry", industry);
  if (type)     query = query.eq("type", type);
  if (q)        query = query.ilike("title", `%${q}%`);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

export async function POST(req: NextRequest) {
  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  const { author_name, title, body: postBody, industry, type, user_id, poll_options } =
    body as {
      author_name?: string; title?: string; body?: string;
      industry?: string; type?: string; user_id?: string;
      poll_options?: string[];
    };

  if (!author_name?.trim()) return NextResponse.json({ error: "author_name required" }, { status: 400 });
  if (!title?.trim())       return NextResponse.json({ error: "title required" },       { status: 400 });
  if (!postBody?.trim())    return NextResponse.json({ error: "body required" },         { status: 400 });

  // Optional poll: 2–5 non-empty options
  const options = (poll_options ?? [])
    .map((o) => (typeof o === "string" ? o.trim() : ""))
    .filter(Boolean);
  if (poll_options !== undefined && options.length > 0) {
    if (options.length < 2)
      return NextResponse.json({ error: "A poll needs at least 2 options." }, { status: 400 });
    if (options.length > 5)
      return NextResponse.json({ error: "A poll can have at most 5 options." }, { status: 400 });
    if (options.some((o) => o.length > 80))
      return NextResponse.json({ error: "Poll options must be 80 characters or less." }, { status: 400 });
  }
  const hasPoll = options.length >= 2;

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("forum_posts")
    .insert({
      author_name: author_name.trim(),
      title:       title.trim(),
      body:        postBody.trim(),
      industry:    industry ?? null,
      type:        type ?? null,
      user_id:     user_id ?? null,
      has_poll:    hasPoll,
    })
    .select("id")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (hasPoll) {
    const { error: pollErr } = await admin
      .from("forum_poll_options")
      .insert(options.map((label, position) => ({ post_id: data.id, label, position })));
    if (pollErr) {
      // Roll back the post so we never leave a broken poll behind
      await admin.from("forum_posts").delete().eq("id", data.id);
      return NextResponse.json({ error: pollErr.message }, { status: 500 });
    }
  }

  return NextResponse.json({ id: data.id }, { status: 201 });
}
