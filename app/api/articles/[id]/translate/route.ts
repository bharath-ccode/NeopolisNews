import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { getOrCreateTeluguTranslation } from "@/lib/translate";

export const maxDuration = 60;

/** POST — translate a published article to Telugu (cached after the first call). */
export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const sb = createAdminClient();

  const { data: article } = await sb
    .from("articles")
    .select("id, title, excerpt, content")
    .eq("id", params.id)
    .eq("status", "published")
    .single();

  if (!article) {
    return NextResponse.json({ error: "Article not found" }, { status: 404 });
  }

  try {
    const { translation, cached } = await getOrCreateTeluguTranslation(sb, article);
    return NextResponse.json({ ...translation, cached });
  } catch (err) {
    console.error("translate:", err);
    return NextResponse.json({ error: "Translation failed" }, { status: 502 });
  }
}
