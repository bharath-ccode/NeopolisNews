import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

function formatDisplayDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const builderId = searchParams.get("builder_id");
  const status = searchParams.get("status") ?? "published";

  const admin = createAdminClient();
  let query = admin.from("articles").select("*");

  // status=all means no filter (builder views own drafts + published)
  if (status !== "all") query = query.eq("status", status);
  if (category) query = query.eq("category", category);
  if (builderId && builderId !== "all") query = query.eq("builder_id", builderId);

  const { data, error } = await query.order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body?.title || !body?.excerpt || !body?.content || !body?.category) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("articles")
    .insert({
      title:      body.title,
      excerpt:    body.excerpt,
      content:    body.content,
      category:   body.category,
      tag:        body.tag,
      tag_color:  body.tagColor,
      author:     body.author ?? "NeopolisNews Staff",
      date:       body.date ?? formatDisplayDate(new Date().toISOString()),
      read_time:  body.readTime ?? "3 min",
      views:      0,
      sponsored:  body.sponsored ?? false,
      status:     body.status ?? "draft",
      image_url:  body.imageUrl ?? null,
      video_url:  body.videoUrl ?? null,
      source:     body.source ?? null,
      project_id: body.projectId ?? null,
      builder_id: body.builderId ?? null,
    })
    .select("id")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ id: data.id });
}

export async function PATCH(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const { id, ...fields } = body ?? {};
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const patch: Record<string, unknown> = {};
  if (fields.title     !== undefined) patch.title      = fields.title;
  if (fields.excerpt   !== undefined) patch.excerpt    = fields.excerpt;
  if (fields.content   !== undefined) patch.content    = fields.content;
  if (fields.category  !== undefined) patch.category   = fields.category;
  if (fields.tag       !== undefined) patch.tag        = fields.tag;
  if (fields.tagColor  !== undefined) patch.tag_color  = fields.tagColor;
  if (fields.author    !== undefined) patch.author     = fields.author;
  if (fields.readTime  !== undefined) patch.read_time  = fields.readTime;
  if (fields.status    !== undefined) patch.status     = fields.status;
  if (fields.imageUrl  !== undefined) patch.image_url  = fields.imageUrl ?? null;
  if (fields.videoUrl  !== undefined) patch.video_url  = fields.videoUrl ?? null;
  if (fields.source    !== undefined) patch.source     = fields.source ?? null;
  if (fields.projectId !== undefined) patch.project_id = fields.projectId ?? null;
  if (fields.builderId !== undefined) patch.builder_id = fields.builderId ?? null;

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("articles")
    .update(patch)
    .eq("id", id)
    .select("id")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ id: data.id });
}
