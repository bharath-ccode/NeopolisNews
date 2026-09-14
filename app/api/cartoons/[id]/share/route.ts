import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

/** POST — fired when a reader actually clicks "Share on WhatsApp" on a
 *  cartoon. whatsapp_share_count starts from a seeded baseline at publish
 *  time (20260828_cartoon_publish_effects.sql); this is what was missing to
 *  make it a blended count like view_count instead of a number frozen at
 *  publish forever. */
export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  const admin = createAdminClient();
  const { data } = await admin
    .from("daily_cartoons")
    .select("whatsapp_share_count")
    .eq("id", params.id)
    .single();
  if (data) {
    await admin
      .from("daily_cartoons")
      .update({ whatsapp_share_count: (data.whatsapp_share_count ?? 0) + 1 })
      .eq("id", params.id);
  }
  return NextResponse.json({ ok: true });
}
