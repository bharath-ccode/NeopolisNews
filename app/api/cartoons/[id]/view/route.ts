import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

/** POST — fired once per page load of /cartoon for whichever cartoon is on
 *  screen (today's or a picked archive one); same fire-and-forget, no-dedup
 *  pattern as the article view tracker. view_count starts from a seeded
 *  baseline at publish time (20260828_cartoon_publish_effects.sql) and real
 *  views add on top from here, same "blended" treatment as article views. */
export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  const admin = createAdminClient();
  const { data } = await admin
    .from("daily_cartoons")
    .select("view_count")
    .eq("id", params.id)
    .single();
  if (data) {
    await admin
      .from("daily_cartoons")
      .update({ view_count: (data.view_count ?? 0) + 1 })
      .eq("id", params.id);
  }
  return NextResponse.json({ ok: true });
}
