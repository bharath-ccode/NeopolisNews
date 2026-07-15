import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { getOrCreateTeluguTranslation } from "@/lib/translate";

export const maxDuration = 60;

export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const sb = createAdminClient();

  const { error } = await sb
    .from("articles")
    .update({ status: "published" })
    .eq("id", params.id)
    .eq("status", "draft");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Publish-time Telugu translation for digests — best-effort: a translation
  // failure must not roll back or block the publish (readers can still trigger
  // it lazily from the article page).
  let translated = false;
  try {
    const { data: article } = await sb
      .from("articles")
      .select("id, title, excerpt, content")
      .eq("id", params.id)
      .single();
    if (article) {
      await getOrCreateTeluguTranslation(sb, article);
      translated = true;
    }
  } catch (err) {
    console.error("approve: Telugu translation failed:", err);
  }

  return NextResponse.json({ success: true, translated });
}
