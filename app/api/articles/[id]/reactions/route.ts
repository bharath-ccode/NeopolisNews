import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { requireUser, optionalUser } from "@/lib/apiAuth";

export const dynamic = "force-dynamic";

const REACTIONS = ["like", "love", "insightful"] as const;
type Reaction = (typeof REACTIONS)[number];

/** GET → { counts: { like, love, insightful }, mine: "like" | null }
 *  "mine" is filled when a valid Authorization header is sent. */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const userId = (await optionalUser(req))?.id ?? null;
  const admin = createAdminClient();

  const { data, error } = await admin
    .from("article_reactions")
    .select("reaction, user_id")
    .eq("article_id", params.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const counts: Record<Reaction, number> = { like: 0, love: 0, insightful: 0 };
  let mine: Reaction | null = null;
  for (const row of data ?? []) {
    const r = row.reaction as Reaction;
    if (REACTIONS.includes(r)) counts[r]++;
    if (userId && row.user_id === userId) mine = r;
  }
  return NextResponse.json({ counts, mine });
}

/** POST { reaction } — toggles: same reaction removes it, a different one
 *  replaces it (one per user per article). Identity from the token. */
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireUser(req);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const user_id = auth.user.id;

  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  const { reaction } = body as { reaction?: string };
  if (!reaction || !REACTIONS.includes(reaction as Reaction))
    return NextResponse.json({ error: "Invalid reaction." }, { status: 400 });

  const admin = createAdminClient();

  const { data: article } = await admin
    .from("articles")
    .select("id")
    .eq("id", params.id)
    .eq("status", "published")
    .single();
  if (!article) return NextResponse.json({ error: "Article not found" }, { status: 404 });

  const { data: existing } = await admin
    .from("article_reactions")
    .select("id, reaction")
    .eq("article_id", params.id)
    .eq("user_id", user_id)
    .maybeSingle();

  if (existing && existing.reaction === reaction) {
    // Toggle off
    const { error } = await admin.from("article_reactions").delete().eq("id", existing.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ mine: null });
  }

  if (existing) {
    const { error } = await admin
      .from("article_reactions")
      .update({ reaction })
      .eq("id", existing.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ mine: reaction });
  }

  const { error } = await admin
    .from("article_reactions")
    .insert({ article_id: params.id, user_id, reaction });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ mine: reaction }, { status: 201 });
}
