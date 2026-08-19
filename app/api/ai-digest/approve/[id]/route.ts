import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { getOrCreateTeluguTranslation } from "@/lib/translate";
import { generateHeadlineCard } from "@/lib/generateHeadlineCard";

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

  const { data: article } = await sb
    .from("articles")
    .select("id, title, excerpt, content, tag, image_url")
    .eq("id", params.id)
    .single();

  // Auto-generate the branded headline card as the cover whenever an
  // AI-composed article (digest or Editor's Desk) gets approved without
  // one — best-effort: a failure here must not block the publish.
  let coverGenerated = false;
  if (article && !article.image_url) {
    try {
      const url = await generateHeadlineCard(article.title, article.tag);
      await sb.from("articles").update({ image_url: url }).eq("id", params.id);
      coverGenerated = true;
    } catch (err) {
      console.error("approve: headline card generation failed:", err);
    }
  }

  // Publish-time Telugu translation for digests — best-effort: a translation
  // failure must not roll back or block the publish (readers can still trigger
  // it lazily from the article page).
  let translated = false;
  try {
    if (article) {
      await getOrCreateTeluguTranslation(sb, article);
      translated = true;
    }
  } catch (err) {
    console.error("approve: Telugu translation failed:", err);
  }

  return NextResponse.json({ success: true, translated, coverGenerated });
}
