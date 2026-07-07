import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("daily_cartoons")
    .select("id, title, image_url, caption, artist_name, publish_date, is_contest, winner_name, winner_caption, status, created_at")
    .order("publish_date", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

/** POST { title, image_url, caption?, artist_name?, publish_date, is_contest?, status? } */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const { title, image_url, caption, artist_name, publish_date, is_contest, status } = body ?? {};

  if (!title?.trim())     return NextResponse.json({ error: "title required" }, { status: 400 });
  if (!image_url?.trim()) return NextResponse.json({ error: "Upload the cartoon image first." }, { status: 400 });
  if (!publish_date)      return NextResponse.json({ error: "publish_date required" }, { status: 400 });

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("daily_cartoons")
    .upsert(
      {
        title:        title.trim(),
        image_url:    image_url.trim(),
        caption:      caption?.trim() || null,
        artist_name:  artist_name?.trim() || "NeopolisNews",
        publish_date,
        is_contest:   Boolean(is_contest),
        status:       status === "published" ? "published" : "draft",
      },
      { onConflict: "publish_date" }
    )
    .select("id")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ id: data.id }, { status: 201 });
}
