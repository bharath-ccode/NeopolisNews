import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const admin = createAdminClient();

  const [postRes, repliesRes] = await Promise.all([
    admin.from("forum_posts").select("*").eq("id", params.id).single(),
    admin.from("forum_replies").select("*").eq("post_id", params.id).order("created_at", { ascending: true }),
  ]);

  if (postRes.error || !postRes.data) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (postRes.data.status === "removed") return NextResponse.json({ error: "Removed" }, { status: 410 });

  return NextResponse.json({ post: postRes.data, replies: repliesRes.data ?? [] });
}

// Admin: recategorize or change status
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  const { industry, type, status } =
    body as { industry?: string | null; type?: string | null; status?: string };

  const update: Record<string, unknown> = {};
  if (industry !== undefined) update.industry = industry;
  if (type     !== undefined) update.type     = type;
  if (status   !== undefined) update.status   = status;

  if (Object.keys(update).length === 0)
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });

  const admin = createAdminClient();
  const { error } = await admin.from("forum_posts").update(update).eq("id", params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
