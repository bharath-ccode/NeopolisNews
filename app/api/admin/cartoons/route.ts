import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { bakePublishedCartoonImage } from "@/lib/bakeCartoonText";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

export async function GET() {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("daily_cartoons")
    .select("id, title, image_url, caption, artist_name, publish_date, is_contest, winner_name, winner_caption, status, created_at")
    .order("publish_date", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

/** POST { title, image_url, caption?, artist_name?, publish_date, is_contest?, status? }
 *  Publishing bakes the title + caption onto the image itself, from the
 *  clean artwork (image_url as submitted) — so the final asset carries them
 *  visually, not just the DB row. artwork_url keeps the clean source so a
 *  later unpublish/republish cycle re-bakes fresh instead of stacking. */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const { title, image_url, caption, artist_name, publish_date, is_contest, status } = body ?? {};

  if (!title?.trim())     return NextResponse.json({ error: "title required" }, { status: 400 });
  if (!image_url?.trim()) return NextResponse.json({ error: "Upload the cartoon image first." }, { status: 400 });
  if (!publish_date)      return NextResponse.json({ error: "publish_date required" }, { status: 400 });

  const cleanTitle = title.trim();
  const cleanCaption = caption?.trim() || null;
  const artworkUrl = image_url.trim();
  const willPublish = status === "published";

  let finalImageUrl = artworkUrl;
  if (willPublish) {
    try {
      finalImageUrl = await bakePublishedCartoonImage(artworkUrl, cleanTitle, cleanCaption);
    } catch (err) {
      console.error("cartoon publish: baking failed:", err);
      // fall back to the clean artwork rather than blocking the publish
    }
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("daily_cartoons")
    .upsert(
      {
        title:        cleanTitle,
        image_url:    finalImageUrl,
        artwork_url:  artworkUrl,
        caption:      cleanCaption,
        artist_name:  artist_name?.trim() || "NeopolisNews",
        publish_date,
        is_contest:   Boolean(is_contest),
        status:       willPublish ? "published" : "draft",
      },
      { onConflict: "publish_date" }
    )
    .select("id")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ id: data.id }, { status: 201 });
}
