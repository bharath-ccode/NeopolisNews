import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/apiAuth";

export const dynamic = "force-dynamic";

/** POST { option_id } — cast or change a vote (one per user per poll). Token-verified. */
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireUser(req);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const user_id = auth.user.id;

  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  const { option_id } = body as { option_id?: string };
  if (!option_id) return NextResponse.json({ error: "option_id required" }, { status: 400 });

  const admin = createAdminClient();

  const { data: post } = await admin
    .from("forum_posts")
    .select("id, status, has_poll")
    .eq("id", params.id)
    .single();
  if (!post || !post.has_poll) return NextResponse.json({ error: "Poll not found" }, { status: 404 });
  if (post.status !== "active") return NextResponse.json({ error: "This thread is closed." }, { status: 403 });

  const { data: option } = await admin
    .from("forum_poll_options")
    .select("id")
    .eq("id", option_id)
    .eq("post_id", params.id)
    .single();
  if (!option) return NextResponse.json({ error: "Invalid option" }, { status: 400 });

  const { error } = await admin
    .from("forum_poll_votes")
    .upsert(
      { post_id: params.id, option_id, user_id },
      { onConflict: "post_id,user_id" }
    );
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
