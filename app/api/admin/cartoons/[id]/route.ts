import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { awardPoints, CAPTION_CONTEST_POINTS } from "@/lib/points";

export const dynamic = "force-dynamic";

/** GET — caption entries for winner picking. */
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("cartoon_captions")
    .select("id, user_id, author_name, body, created_at")
    .eq("cartoon_id", params.id)
    .order("created_at", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

/** PATCH { status? } to publish/unpublish, or { winner_caption_id } to close a
 *  contest — sets the winning caption on the cartoon and awards points. */
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json().catch(() => null);
  const { status, winner_caption_id } = body ?? {};

  const admin = createAdminClient();

  const { data: cartoon } = await admin
    .from("daily_cartoons")
    .select("id, title, is_contest, winner_user_id")
    .eq("id", params.id)
    .single();
  if (!cartoon) return NextResponse.json({ error: "Cartoon not found" }, { status: 404 });

  if (winner_caption_id) {
    if (!cartoon.is_contest)
      return NextResponse.json({ error: "Not a contest cartoon." }, { status: 400 });

    const { data: entry } = await admin
      .from("cartoon_captions")
      .select("id, user_id, author_name, body")
      .eq("id", winner_caption_id)
      .eq("cartoon_id", params.id)
      .single();
    if (!entry) return NextResponse.json({ error: "Caption entry not found." }, { status: 404 });

    const { error } = await admin
      .from("daily_cartoons")
      .update({
        winner_user_id: entry.user_id,
        winner_name:    entry.author_name,
        winner_caption: entry.body,
        caption:        entry.body, // the winning caption becomes the cartoon's caption
      })
      .eq("id", params.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    await awardPoints(admin, {
      userId:      entry.user_id,
      points:      CAPTION_CONTEST_POINTS,
      sourceType:  "caption_contest_win",
      sourceId:    cartoon.id,
      description: `Won the caption contest: ${cartoon.title}`,
    });

    return NextResponse.json({ ok: true, winner: entry.author_name });
  }

  if (status === "published" || status === "draft") {
    const { error } = await admin
      .from("daily_cartoons")
      .update({ status })
      .eq("id", params.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true, status });
  }

  return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const admin = createAdminClient();
  const { error } = await admin.from("daily_cartoons").delete().eq("id", params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
