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
    .select("id, author_name, title, body, industry, type, reply_count, created_at")
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

  const { author_name, title, body: postBody, industry, type, user_id } =
    body as { author_name?: string; title?: string; body?: string; industry?: string; type?: string; user_id?: string };

  if (!author_name?.trim()) return NextResponse.json({ error: "author_name required" }, { status: 400 });
  if (!title?.trim())       return NextResponse.json({ error: "title required" },       { status: 400 });
  if (!postBody?.trim())    return NextResponse.json({ error: "body required" },         { status: 400 });

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
    })
    .select("id")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ id: data.id }, { status: 201 });
}
