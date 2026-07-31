import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { optionalUser } from "@/lib/apiAuth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const userId = (await optionalUser(req))?.id ?? null;
  const admin = createAdminClient();

  const [postRes, repliesRes] = await Promise.all([
    admin.from("forum_posts").select("*").eq("id", params.id).single(),
    admin.from("forum_replies").select("*").eq("post_id", params.id).order("created_at", { ascending: true }),
  ]);

  if (postRes.error || !postRes.data) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (postRes.data.status === "removed") return NextResponse.json({ error: "Removed" }, { status: 410 });

  // Poll data (options with vote counts + the caller's own vote)
  let poll: { options: { id: string; label: string; votes: number }[]; total: number; my_vote: string | null } | null = null;
  if (postRes.data.has_poll) {
    const [optionsRes, votesRes] = await Promise.all([
      admin.from("forum_poll_options").select("id, label, position").eq("post_id", params.id).order("position"),
      admin.from("forum_poll_votes").select("option_id, user_id").eq("post_id", params.id),
    ]);
    const votes = votesRes.data ?? [];
    const counts = new Map<string, number>();
    let myVote: string | null = null;
    for (const v of votes) {
      counts.set(v.option_id, (counts.get(v.option_id) ?? 0) + 1);
      if (userId && v.user_id === userId) myVote = v.option_id;
    }
    poll = {
      options: (optionsRes.data ?? []).map((o) => ({
        id: o.id,
        label: o.label,
        votes: counts.get(o.id) ?? 0,
      })),
      total: votes.length,
      my_vote: myVote,
    };
  }

  return NextResponse.json({ post: postRes.data, replies: repliesRes.data ?? [], poll });
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
